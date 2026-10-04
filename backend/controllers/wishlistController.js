import Product from "../models/Product.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

// @desc    Like / wishlist: bəyənməyibsə əlavə edir, bəyənibsə çıxarır (toggle)
// @route   POST /api/products/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    if (!(await Product.exists({ _id: productId }))) {
      throw new ApiError(404, "Product not found");
    }

    /*
      Şərtli yeniləmə: "siyahıda YOXDURSA əlavə et". Baza bunu bir addımda edir,
      ona görə düyməni tez-tez iki dəfə basmaq da likesCount-u pozmur.
    */
    const added = await User.updateOne(
      { _id: userId, savedProducts: { $ne: productId } },
      { $push: { savedProducts: productId } }
    );

    let change = 0;
    if (added.modifiedCount === 1) {
      change = 1;
    } else {
      const removed = await User.updateOne({ _id: userId }, { $pull: { savedProducts: productId } });
      if (removed.modifiedCount === 1) change = -1;
    }

    const product = change
      ? await Product.findByIdAndUpdate(
          productId,
          { $inc: { likesCount: change } },
          { returnDocument: "after" }
        )
      : await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const liked = change === 1;
    res.json({
      success: true,
      liked,
      likesCount: product.likesCount,
      message: liked ? "Added to wishlist" : "Removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Daxil olmuş istifadəçinin wishlist-i (məhsulların tam məlumatı ilə)
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("savedProducts");

    res.json({ success: true, count: user.savedProducts.length, products: user.savedProducts });
  } catch (error) {
    next(error);
  }
};
