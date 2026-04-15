const Coupon = require("../models/Coupon.model");
const ApiError = require("../../../shared/utils/apiError");

class CouponService {
  async validateAndApply(code, orderAmount, userId) {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

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

  async createCoupon(data, createdBy) {
    const coupon = new Coupon({ ...data, createdBy });
    return await coupon.save();
  }

  async getCoupons(filters = {}) {
    const query = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    return await Coupon.find(query).sort({ createdAt: -1 });
  }
}

module.exports = new CouponService();
