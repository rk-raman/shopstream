const mongoose = require("mongoose");
const Inventory = require("../models/Inventory.model");
const Product = require("../../product/models/Product.model");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { INVENTORY_EVENTS } = require("../../../shared/events/eventTypes");

class InventoryService {
  async initializeProductInventory(productId, variants = []) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const inventoryItems = [];

    if (product.hasVariants && variants.length > 0) {
      // Create inventory for each variant
      for (const variant of variants) {
        const inventory = new Inventory({
          product: productId,
          variant: {
            variantId: variant._id,
            sku: variant.sku,
          },
          totalStock: variant.stock || 0,
          availableStock: variant.stock || 0,
        });

        await inventory.save();
        inventoryItems.push(inventory);
      }
    } else {
      // Create inventory for simple product
      const inventory = new Inventory({
        product: productId,
        variant: {
          sku: product.sku || `PRD-${productId}`,
        },
        totalStock: product.stock || 0,
        availableStock: product.stock || 0,
      });

      await inventory.save();
      inventoryItems.push(inventory);
    }

    return inventoryItems;
  }

  async updateStock(
    productId,
    variantSku = null,
    quantity,
    type = "adjustment",
    reference,
    reason,
    performedBy
  ) {
    let query = { product: productId };
    if (variantSku) {
      query["variant.sku"] = variantSku;
    }

    const inventory = await Inventory.findOne(query);
    if (!inventory) {
      throw new ApiError(404, "Inventory record not found");
    }

    const oldStock = inventory.availableStock;

    try {
      switch (type) {
        case "in":
          await inventory.addStock(quantity, reference, reason, performedBy);
          break;
        case "out":
          await inventory.removeStock(quantity, reference, reason, performedBy);
          break;
        case "adjustment":
          const difference = quantity - inventory.totalStock;
          if (difference > 0) {
            await inventory.addStock(
              difference,
              reference,
              reason,
              performedBy
            );
          } else if (difference < 0) {
            await inventory.removeStock(
              Math.abs(difference),
              reference,
              reason,
              performedBy
            );
          }
          break;
      }

      // Publish inventory update event
      eventEmitter.publish(INVENTORY_EVENTS.INVENTORY_UPDATED, {
        productId,
        variantSku,
        oldStock,
        newStock: inventory.availableStock,
        type,
        reference,
        timestamp: new Date().toISOString(),
      });

      // Check for low stock or out of stock
      if (inventory.availableStock <= 0) {
        eventEmitter.publish(INVENTORY_EVENTS.OUT_OF_STOCK, {
          productId,
          variantSku,
          timestamp: new Date().toISOString(),
        });
      } else if (inventory.availableStock <= inventory.lowStockThreshold) {
        eventEmitter.publish(INVENTORY_EVENTS.LOW_STOCK_ALERT, {
          productId,
          variantSku,
          currentStock: inventory.availableStock,
          threshold: inventory.lowStockThreshold,
          timestamp: new Date().toISOString(),
        });
      }

      return inventory;
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  }

  async checkAvailability(productId, variantSku = null, requestedQuantity = 1) {
    let query = { product: productId, status: "active" };
    if (variantSku) {
      query["variant.sku"] = variantSku;
    }

    const inventory = await Inventory.findOne(query);
    if (!inventory) {
      return false;
    }

    return inventory.availableStock >= requestedQuantity;
  }

  /**
   * ATOMIC reserve stock using findOneAndUpdate with $inc.
   * The condition `availableStock >= quantity` is checked atomically
   * with the decrement — if two requests race, only one succeeds.
   */
  async reserveStock(productId, variantSku = null, quantity, orderId) {
    let query = { product: productId, availableStock: { $gte: quantity } };
    if (variantSku) query["variant.sku"] = variantSku;

    const inventory = await Inventory.findOneAndUpdate(
      query,
      {
        $inc: { availableStock: -quantity, reservedStock: quantity },
        $push: {
          movements: {
            type: "reserved",
            quantity,
            reference: String(orderId),
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!inventory) {
      const exists = await Inventory.findOne({
        product: productId,
        ...(variantSku ? { "variant.sku": variantSku } : {}),
      });
      if (!exists) throw new ApiError(404, "Inventory record not found");
      throw new ApiError(409, `Insufficient stock. Only ${exists.availableStock} available.`);
    }

    return inventory;
  }

  /**
   * ATOMIC release stock (reverse of reserve).
   */
  async releaseStock(productId, variantSku = null, quantity, orderId) {
    let query = { product: productId, reservedStock: { $gte: quantity } };
    if (variantSku) query["variant.sku"] = variantSku;

    const inventory = await Inventory.findOneAndUpdate(
      query,
      {
        $inc: { availableStock: quantity, reservedStock: -quantity },
        $push: {
          movements: {
            type: "released",
            quantity,
            reference: String(orderId),
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!inventory) {
      throw new ApiError(404, "Inventory record not found or nothing to release");
    }
    return inventory;
  }

  /**
   * ATOMIC stock decrement on Product model directly.
   * Uses findOneAndUpdate with $gte condition — atomic check-and-decrement.
   */
  async atomicDecrementProductStock(productId, variantId, quantity) {
    if (variantId) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, "variants._id": variantId, "variants.stock": { $gte: quantity } },
        { $inc: { "variants.$.stock": -quantity } },
        { new: true }
      );
      if (!product) throw new ApiError(409, "Insufficient variant stock");
      return product;
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!product) throw new ApiError(409, "Insufficient stock");
    return product;
  }

  /**
   * ATOMIC restore product stock (reverse of decrement).
   */
  async atomicIncrementProductStock(productId, variantId, quantity) {
    if (variantId) {
      return await Product.findOneAndUpdate(
        { _id: productId, "variants._id": variantId },
        { $inc: { "variants.$.stock": quantity } },
        { new: true }
      );
    }
    return await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { stock: quantity } },
      { new: true }
    );
  }

  async getLowStockItems(threshold = null) {
    const query = { status: "active" };

    if (threshold) {
      query.availableStock = { $lte: threshold };
    } else {
      query.$expr = { $lte: ["$availableStock", "$lowStockThreshold"] };
    }

    const lowStockItems = await Inventory.find(query)
      .populate("product", "name images")
      .sort({ availableStock: 1 });

    return lowStockItems;
  }

  async getOutOfStockItems() {
    const outOfStockItems = await Inventory.find({
      availableStock: 0,
      status: "active",
    }).populate("product", "name images");

    return outOfStockItems;
  }

  async getInventoryReport(productId = null, dateFrom = null, dateTo = null) {
    let query = {};

    if (productId) {
      query.product = productId;
    }

    const inventoryItems = await Inventory.find(query)
      .populate("product", "name category")
      .sort({ updatedAt: -1 });

    // Filter movements by date if provided
    if (dateFrom || dateTo) {
      inventoryItems.forEach((item) => {
        item.movements = item.movements.filter((movement) => {
          const movementDate = movement.timestamp;
          return (
            (!dateFrom || movementDate >= dateFrom) &&
            (!dateTo || movementDate <= dateTo)
          );
        });
      });
    }

    return inventoryItems;
  }

  async bulkUpdateInventory(updates) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.updateStock(
          update.productId,
          update.variantSku,
          update.quantity,
          update.type || "adjustment",
          update.reference || "bulk-update",
          update.reason || "Bulk inventory update",
          update.performedBy
        );
        results.push({ success: true, productId: update.productId, result });
      } catch (error) {
        results.push({
          success: false,
          productId: update.productId,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Background job to sync inventory with product stock
  async syncProductStock() {
    const inventoryItems = await Inventory.find({ status: "active" });

    for (const inventory of inventoryItems) {
      const product = await Product.findById(inventory.product);

      if (product) {
        if (product.hasVariants && inventory.variant?.variantId) {
          // Update variant stock
          const variant = product.variants.id(inventory.variant.variantId);
          if (variant) {
            variant.stock = inventory.availableStock;
          }
        } else {
          // Update product stock
          product.stock = inventory.availableStock;
        }

        await product.save();
      }
    }

    console.log("Product stock synchronized with inventory");
  }
}

module.exports = new InventoryService();
