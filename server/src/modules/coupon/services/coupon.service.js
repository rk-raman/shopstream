const Coupon = require("../models/Coupon.model");
const ApiError = require("../../../shared/utils/apiError");

class CouponService {
  // --- Validation (used by checkout) ---

  async validateAndApply(code, orderAmount, userId) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw ApiError.notFound("Invalid coupon code");
    }

    const validation = coupon.isValid(orderAmount, userId);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.message);
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);

    return {
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.type,
      discountValue: coupon.value,
      discountAmount,
      description: coupon.description,
    };
  }

  async markUsed(couponId, userId) {
    await Coupon.findByIdAndUpdate(couponId, {
      $inc: { usedCount: 1 },
      $push: { usedBy: { user: userId, usedAt: new Date() } },
    });
  }

  // --- CRUD (seller/admin) ---

  async createCoupon(data, createdBy) {
    // Check for duplicate code
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw ApiError.conflict("A coupon with this code already exists");
    }

    const coupon = new Coupon({ ...data, code: data.code.toUpperCase(), createdBy });
    return await coupon.save();
  }

  async getCoupons(sellerId, options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      status, // active, expired, scheduled, all
      type,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = { createdBy: sellerId };

    // Status filter
    const now = new Date();
    if (status === "active") {
      query.isActive = true;
      query.$and = [
        { $or: [{ validFrom: { $lte: now } }, { validFrom: null }] },
        { $or: [{ validTo: { $gte: now } }, { validTo: null }] },
      ];
    } else if (status === "expired") {
      query.validTo = { $ne: null, $lt: now };
    } else if (status === "scheduled") {
      query.validFrom = { $ne: null, $gt: now };
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (type) query.type = type;

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const coupons = await Coupon.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Coupon.countDocuments(query);

    return {
      coupons,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getCouponById(couponId, sellerId) {
    const coupon = await Coupon.findOne({ _id: couponId, createdBy: sellerId });
    if (!coupon) {
      throw ApiError.notFound("Coupon not found");
    }
    return coupon;
  }

  async updateCoupon(couponId, sellerId, updateData) {
    const coupon = await Coupon.findOne({ _id: couponId, createdBy: sellerId });
    if (!coupon) {
      throw ApiError.notFound("Coupon not found");
    }

    // If code is changing, check for duplicates
    if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {
      const existing = await Coupon.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existing) {
        throw ApiError.conflict("A coupon with this code already exists");
      }
      updateData.code = updateData.code.toUpperCase();
    }

    Object.assign(coupon, updateData);
    return await coupon.save();
  }

  async deleteCoupon(couponId, sellerId) {
    const coupon = await Coupon.findOneAndDelete({
      _id: couponId,
      createdBy: sellerId,
    });
    if (!coupon) {
      throw ApiError.notFound("Coupon not found");
    }
    return coupon;
  }

  async toggleCoupon(couponId, sellerId) {
    const coupon = await Coupon.findOne({ _id: couponId, createdBy: sellerId });
    if (!coupon) {
      throw ApiError.notFound("Coupon not found");
    }
    coupon.isActive = !coupon.isActive;
    return await coupon.save();
  }

  // --- Analytics ---

  async getCouponStats(sellerId) {
    const now = new Date();

    const [totalCoupons, activeCoupons, expiredCoupons, totalRedemptions] =
      await Promise.all([
        Coupon.countDocuments({ createdBy: sellerId }),
        Coupon.countDocuments({
          createdBy: sellerId,
          isActive: true,
          validFrom: { $lte: now },
          validTo: { $gte: now },
        }),
        Coupon.countDocuments({
          createdBy: sellerId,
          validTo: { $lt: now },
        }),
        Coupon.aggregate([
          { $match: { createdBy: sellerId } },
          { $group: { _id: null, total: { $sum: "$usedCount" } } },
        ]),
      ]);

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalRedemptions: totalRedemptions[0]?.total || 0,
    };
  }

  async getCouponUsage(couponId, sellerId, options = {}) {
    const { page = 1, limit = 20 } = options;

    const coupon = await Coupon.findOne({ _id: couponId, createdBy: sellerId })
      .populate("usedBy.user", "firstName lastName email");

    if (!coupon) {
      throw ApiError.notFound("Coupon not found");
    }

    const usedBy = coupon.usedBy || [];
    const total = usedBy.length;
    const start = (page - 1) * limit;
    const paginated = usedBy.slice(start, start + limit);

    return {
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        usedCount: coupon.usedCount,
        usageLimit: coupon.usageLimit,
      },
      usage: paginated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}

module.exports = new CouponService();
