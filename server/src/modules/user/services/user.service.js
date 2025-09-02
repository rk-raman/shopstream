const User = require("../models/User.model");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../shared/events/eventTypes");

class UserService {
  async createUser(userData) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          ...(userData.phone ? [{ phone: userData.phone }] : []),
        ],
      });

      if (existingUser) {
        throw new ApiError(409, "User already exists with this email or phone");
      }

      // Create user
      const user = await User.create(userData);

      // Publish event for other services
      eventEmitter.publish(USER_EVENTS.USER_REGISTERED, {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        timestamp: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Publish event
    eventEmitter.publish(USER_EVENTS.USER_UPDATED, {
      userId: user._id,
      changes: updateData,
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return { message: "User deactivated successfully" };
  }

  // Address management
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // If this is the first address or marked as default, make it default
    if (user.addresses.length === 0 || addressData.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach((addr) => (addr.isDefault = false));
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();

    return user.addresses[user.addresses.length - 1];
  }

  async updateAddress(userId, addressId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    Object.assign(address, updateData);

    // Handle default address logic
    if (updateData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();
    return address;
  }

  async deleteAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return { message: "Address deleted successfully" };
  }

  // Wishlist management
  async addToWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.wishlist.includes(productId)) {
      throw new ApiError(409, "Product already in wishlist");
    }

    user.wishlist.push(productId);
    await user.save();

    return { message: "Product added to wishlist" };
  }

  async removeFromWishlist(userId, productId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return { message: "Product removed from wishlist" };
  }

  async getWishlist(userId, populate = true) {
    let query = User.findById(userId);

    if (populate) {
      query = query.populate({
        path: "wishlist",
        select: "name price images discountPrice rating",
      });
    }

    const user = await query;
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user.wishlist;
  }
}

module.exports = new UserService();
