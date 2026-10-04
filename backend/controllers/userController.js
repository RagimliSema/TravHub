import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";

// @desc    Bütün istifadəçilər (ən yenisi birinci)
// @route   GET /api/users
// @access  Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Bir istifadəçinin məlumatları və sifariş tarixçəsi
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({ success: true, user, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    İstifadəçini silmək
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // admin hesabları (o cümlədən adminin öz hesabı) buradan silinmir – sistem adminsiz qalmasın
    if (user.role === "admin") {
      throw new ApiError(400, "Admin accounts cannot be deleted");
    }

    // istifadəçinin səbəti də silinir. Sifarişlər qalır – mağazanın satış tarixçəsidir.
    await Promise.all([user.deleteOne(), Cart.deleteOne({ user: user._id })]);

    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};
