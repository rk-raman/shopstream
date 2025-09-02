const Cart = require("../models/Cart.model");
const Product = require("../../product/models/Product.model");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { CART_EVENTS } = require("../../../shared/events/eventTypes");

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "name images basePrice discountPrice stock status hasVariants variants",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId });
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

      // Check variant stock
      if (variant.stock < quantity) {
        throw new ApiError(400, "Insufficient stock for selected variant");
      }
    } else {
      // Check product stock
      if (product.stock < quantity) {
        throw new ApiError(400, "Insufficient stock");
      }
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });
    }

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

    // Publish event
    eventEmitter.publish(CART_EVENTS.ITEM_ADDED_TO_CART, {
      userId,
      productId,
      variantId,
      quantity,
      timestamp: new Date().toISOString(),
    });

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

    if (quantity <= 0) {
      eventEmitter.publish(CART_EVENTS.ITEM_REMOVED_FROM_CART, {
        userId,
        productId: item.product,
        timestamp: new Date().toISOString(),
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

    await cart.removeItem(itemId);

    // Publish event
    eventEmitter.publish(CART_EVENTS.ITEM_REMOVED_FROM_CART, {
      userId,
      productId: item.product,
      timestamp: new Date().toISOString(),
    });

    return await this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      await cart.clear();

      eventEmitter.publish(CART_EVENTS.CART_CLEARED, {
        userId,
        timestamp: new Date().toISOString(),
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

    return abandonedCarts;
  }
}

module.exports = new CartService();
