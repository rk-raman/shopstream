const Cart = require("../models/Cart.model");
const Product = require("../../product/models/Product.model");
const ApiError = require("../../../shared/utils/apiError");
const CartEventPublisher = require("../events/publishers/CartEventPublisher");

class CartService {
  constructor() {
    this.eventPublisher = new CartEventPublisher();
  }

  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "name images basePrice discountPrice stock status hasVariants variants",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId });

      // Publish cart created event
      await this.eventPublisher.publishCartCreated({
        cartId: cart._id,
        userId,
        sessionId: null, // TODO: Get from request context
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });
    }

    // Validate cart items and remove inactive products
    await this.validateCartItems(cart);

    return cart;
  }

  async addToCart(userId, productId, variantId = null, quantity = 1) {
    // Fetch product details
    const product = await Product.findById(productId);
    if (!product || product.status !== "active") {
      throw new ApiError(400, "Product not available");
    }

    // Handle variant selection
    let variant = null;
    let price = product.basePrice;
    let discountPrice = product.discountPrice;

    if (product.hasVariants) {
      if (!variantId) {
        throw new ApiError(400, "Please select a variant");
      }

      variant = product.variants.id(variantId);
      if (!variant || !variant.isActive) {
        throw new ApiError(400, "Selected variant is not available");
      }

      price = variant.price;
      discountPrice = variant.discountPrice;

      // Soft stock check (final validation happens atomically at checkout)
      if (variant.stock < quantity) {
        throw new ApiError(400, `Only ${variant.stock} units available for this variant`);
      }
    } else {
      // Soft stock check
      if (product.stock < quantity) {
        throw new ApiError(400, `Only ${product.stock} units available`);
      }
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });

      // Publish cart created event
      await this.eventPublisher.publishCartCreated({
        cartId: cart._id,
        userId,
        sessionId: null, // TODO: Get from request context
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });
    }

    const previousTotal = cart.totalDiscountedPrice;
    const previousItemCount = cart.totalItems;

    // Add item to cart
    await cart.addItem({
      product: productId,
      variant: variant
        ? {
            variantId: variant._id,
            name: variant.name,
            value: variant.value,
            sku: variant.sku,
          }
        : null,
      quantity,
      price,
      discountPrice,
    });

    const totalPrice = quantity * (discountPrice || price);

    // Publish item added event
    await this.eventPublisher.publishItemAdded({
      cartId: cart._id,
      userId,
      productId,
      variantId,
      quantity,
      price: discountPrice || price,
      totalPrice,
      productName: product.name,
      sku: variant?.sku || product.sku,
      category: product.category,
      source: "web",
      userAgent: null, // TODO: Get from request context
      ipAddress: null, // TODO: Get from request context
    });

    // Publish cart updated event
    await this.eventPublisher.publishCartUpdated({
      cartId: cart._id,
      userId,
      changes: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        totalDiscountedPrice: cart.totalDiscountedPrice,
      },
      previousValues: {
        totalItems: previousItemCount,
        totalDiscountedPrice: previousTotal,
      },
      updatedBy: userId,
      source: "web",
      reason: "item_added",
    });

    // Publish value change event if changed
    if (cart.totalDiscountedPrice !== previousTotal) {
      await this.eventPublisher.publishCartValueChanged({
        cartId: cart._id,
        userId,
        previousValue: previousTotal,
        newValue: cart.totalDiscountedPrice,
        valueChange: cart.totalDiscountedPrice - previousTotal,
        valueChangePercentage:
          previousTotal > 0
            ? ((cart.totalDiscountedPrice - previousTotal) / previousTotal) *
              100
            : 100,
        changeReason: "item_added",
        itemCount: cart.totalItems,
      });
    }

    // Publish count change event if changed
    if (cart.totalItems !== previousItemCount) {
      await this.eventPublisher.publishCartItemsCountChanged({
        cartId: cart._id,
        userId,
        previousCount: previousItemCount,
        newCount: cart.totalItems,
        countChange: cart.totalItems - previousItemCount,
        changeReason: "item_added",
        totalValue: cart.totalDiscountedPrice,
      });
    }

    return await this.getCart(userId);
  }

  async updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new ApiError(404, "Item not found in cart");
    }

    const previousQuantity = item.quantity;
    const previousTotal = cart.totalDiscountedPrice;
    const previousItemCount = cart.totalItems;

    // Check stock availability
    const product = await Product.findById(item.product);
    if (product.hasVariants && item.variant) {
      const variant = product.variants.id(item.variant.variantId);
      if (variant.stock < quantity) {
        throw new ApiError(400, "Insufficient stock");
      }
    } else if (product.stock < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    await cart.updateItemQuantity(itemId, quantity);

    // Publish events
    if (quantity <= 0) {
      await this.eventPublisher.publishItemRemoved({
        cartId: cart._id,
        userId,
        productId: item.product,
        variantId: item.variant?.variantId,
        previousQuantity,
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });
    } else {
      await this.eventPublisher.publishItemQuantityUpdated({
        cartId: cart._id,
        userId,
        itemId,
        productId: item.product,
        variantId: item.variant?.variantId,
        previousQuantity,
        newQuantity: quantity,
        quantityChange: quantity - previousQuantity,
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });
    }

    await this.eventPublisher.publishCartUpdated({
      cartId: cart._id,
      userId,
      changes: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        totalDiscountedPrice: cart.totalDiscountedPrice,
      },
      previousValues: {
        totalItems: previousItemCount,
        totalDiscountedPrice: previousTotal,
      },
      updatedBy: userId,
      source: "web",
      reason: "item_updated",
    });

    // Publish value and count change events if changed
    if (cart.totalDiscountedPrice !== previousTotal) {
      await this.eventPublisher.publishCartValueChanged({
        cartId: cart._id,
        userId,
        previousValue: previousTotal,
        newValue: cart.totalDiscountedPrice,
        valueChange: cart.totalDiscountedPrice - previousTotal,
        valueChangePercentage:
          previousTotal > 0
            ? ((cart.totalDiscountedPrice - previousTotal) / previousTotal) *
              100
            : 100,
        changeReason: "item_updated",
        itemCount: cart.totalItems,
      });
    }

    if (cart.totalItems !== previousItemCount) {
      await this.eventPublisher.publishCartItemsCountChanged({
        cartId: cart._id,
        userId,
        previousCount: previousItemCount,
        newCount: cart.totalItems,
        countChange: cart.totalItems - previousItemCount,
        changeReason: "item_updated",
        totalValue: cart.totalDiscountedPrice,
      });
    }

    return await this.getCart(userId);
  }

  async removeFromCart(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new ApiError(404, "Item not found in cart");
    }

    const previousTotal = cart.totalDiscountedPrice;
    const previousItemCount = cart.totalItems;

    await cart.removeItem(itemId);

    // Publish events
    await this.eventPublisher.publishItemRemoved({
      cartId: cart._id,
      userId,
      productId: item.product,
      variantId: item.variant?.variantId,
      previousQuantity: item.quantity,
      source: "web",
      userAgent: null, // TODO: Get from request context
      ipAddress: null, // TODO: Get from request context
    });

    await this.eventPublisher.publishCartUpdated({
      cartId: cart._id,
      userId,
      changes: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        totalDiscountedPrice: cart.totalDiscountedPrice,
      },
      previousValues: {
        totalItems: previousItemCount,
        totalDiscountedPrice: previousTotal,
      },
      updatedBy: userId,
      source: "web",
      reason: "item_removed",
    });

    // Publish value and count change events
    await this.eventPublisher.publishCartValueChanged({
      cartId: cart._id,
      userId,
      previousValue: previousTotal,
      newValue: cart.totalDiscountedPrice,
      valueChange: cart.totalDiscountedPrice - previousTotal,
      valueChangePercentage:
        previousTotal > 0
          ? ((cart.totalDiscountedPrice - previousTotal) / previousTotal) * 100
          : 100,
      changeReason: "item_removed",
      itemCount: cart.totalItems,
    });

    await this.eventPublisher.publishCartItemsCountChanged({
      cartId: cart._id,
      userId,
      previousCount: previousItemCount,
      newCount: cart.totalItems,
      countChange: cart.totalItems - previousItemCount,
      changeReason: "item_removed",
      totalValue: cart.totalDiscountedPrice,
    });

    return await this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      const previousTotal = cart.totalDiscountedPrice;
      const previousItemCount = cart.totalItems;

      await cart.clear();

      // Publish events
      await this.eventPublisher.publishCartCleared({
        cartId: cart._id,
        userId,
        clearedItems: previousItemCount,
        clearedValue: previousTotal,
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });

      await this.eventPublisher.publishCartUpdated({
        cartId: cart._id,
        userId,
        changes: {
          totalItems: 0,
          totalPrice: 0,
          totalDiscountedPrice: 0,
        },
        previousValues: {
          totalItems: previousItemCount,
          totalDiscountedPrice: previousTotal,
        },
        updatedBy: userId,
        source: "web",
        reason: "cart_cleared",
      });

      await this.eventPublisher.publishCartValueChanged({
        cartId: cart._id,
        userId,
        previousValue: previousTotal,
        newValue: 0,
        valueChange: -previousTotal,
        valueChangePercentage:
          previousTotal > 0 ? ((0 - previousTotal) / previousTotal) * 100 : 100,
        changeReason: "cart_cleared",
        itemCount: 0,
      });

      await this.eventPublisher.publishCartItemsCountChanged({
        cartId: cart._id,
        userId,
        previousCount: previousItemCount,
        newCount: 0,
        countChange: -previousItemCount,
        changeReason: "cart_cleared",
        totalValue: 0,
      });
    }

    return { message: "Cart cleared successfully" };
  }

  async validateCartItems(cart) {
    let hasChanges = false;
    const itemsToRemove = [];

    for (const item of cart.items) {
      const product = item.product;

      // Check if product is still active
      if (!product || product.status !== "active") {
        itemsToRemove.push(item._id);
        hasChanges = true;
        continue;
      }

      // Check stock availability
      let availableStock = product.stock;
      if (product.hasVariants && item.variant) {
        const variant = product.variants.id(item.variant.variantId);
        if (!variant || !variant.isActive) {
          itemsToRemove.push(item._id);
          hasChanges = true;
          continue;
        }
        availableStock = variant.stock;
      }

      // Update quantity if exceeds available stock
      if (item.quantity > availableStock) {
        if (availableStock > 0) {
          item.quantity = availableStock;
          hasChanges = true;
        } else {
          itemsToRemove.push(item._id);
          hasChanges = true;
        }
      }
    }

    // Remove invalid items
    if (itemsToRemove.length > 0) {
      cart.items = cart.items.filter(
        (item) =>
          !itemsToRemove.some((id) => id.toString() === item._id.toString())
      );
    }

    // Save changes if any
    if (hasChanges) {
      await cart.save();

      // Publish cart synchronized event
      await this.eventPublisher.publishCartSynchronized({
        cartId: cart._id,
        userId: cart.user,
        removedItems: itemsToRemove.length,
        updatedItems: cart.items.length,
        totalItems: cart.totalItems,
        totalDiscountedPrice: cart.totalDiscountedPrice,
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });
    }
  }

  async getCartSummary(userId) {
    const cart = await this.getCart(userId);

    return {
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      totalDiscountedPrice: cart.totalDiscountedPrice,
      savedAmount: cart.savedAmount,
      estimatedTax: Math.round(cart.totalDiscountedPrice * 0.18), // 18% GST
      shippingCharges: cart.totalDiscountedPrice > 500 ? 0 : 40,
      finalAmount:
        cart.totalDiscountedPrice +
        Math.round(cart.totalDiscountedPrice * 0.18) +
        (cart.totalDiscountedPrice > 500 ? 0 : 40),
    };
  }

  // Check for abandoned carts (for marketing campaigns)
  async findAbandonedCarts(daysAgo = 1) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const abandonedCarts = await Cart.find({
      lastModified: { $lt: cutoffDate },
      totalItems: { $gt: 0 },
    }).populate("user", "firstName lastName email");

    // Publish abandoned cart events for each cart
    abandonedCarts.forEach((cart) => {
      this.eventPublisher.publishCartAbandoned({
        cartId: cart._id,
        userId: cart.user._id,
        abandonedDays: daysAgo,
        totalItems: cart.totalItems,
        totalValue: cart.totalDiscountedPrice,
        lastModified: cart.lastModified,
        userEmail: cart.user.email,
        userName: `${cart.user.firstName} ${cart.user.lastName}`,
        source: "web",
        userAgent: null, // TODO: Get from request context
        ipAddress: null, // TODO: Get from request context
      });
    });

    return abandonedCarts;
  }
}

module.exports = new CartService();
