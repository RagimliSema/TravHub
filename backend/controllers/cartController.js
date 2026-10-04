import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { isObjectId, roundPrice } from "../utils/helpers.js";

// səbətdə göstərilən məhsul sahələri
const PRODUCT_FIELDS = "title price image stock category";

// miqdar 1 və ya daha böyük tam ədəd olmalıdır
const readQuantity = (value) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new ApiError(400, "Quantity must be a whole number greater than 0");
  }
  return value;
};

const findProduct = async (productId) => {
  if (!isObjectId(productId)) {
    throw new ApiError(400, "A valid productId is required");
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

// stokda olandan çox əlavə etmək olmaz
const checkStock = (product, quantity) => {
  if (product.stock === 0) {
    throw new ApiError(400, `${product.title} is out of stock`);
  }
  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} item(s) of ${product.title} left in stock`);
  }
};

/*
  Səbəti frontend üçün hazır formada qaytarır:
  məhsulun məlumatı + hər sətrin cəmi + ümumi say və qiymət.
  Qiymətlər həmişə məhsulun HAZIRKI qiymətindən hesablanır.
*/
const sendCart = async (res, cart) => {
  if (cart) {
    await cart.populate("items.product", PRODUCT_FIELDS);
  }

  const items = (cart?.items ?? [])
    .filter((item) => item.product) // silinmiş məhsullar göstərilmir
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: roundPrice(item.product.price * item.quantity),
    }));

  res.json({
    success: true,
    cart: {
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: roundPrice(items.reduce((sum, item) => sum + item.subtotal, 0)),
    },
  });
};

// @desc    Səbəti görmək
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    await sendCart(res, cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Səbətə məhsul əlavə etmək (artıq varsa miqdarı artır)
// @route   POST /api/cart   body: { productId, quantity = 1 }
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body ?? {};
    const amount = readQuantity(quantity);
    const product = await findProduct(productId);

    // istifadəçinin səbəti yoxdursa yaradılır
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { items: [] } },
      { upsert: true, returnDocument: "after" }
    );

    const item = cart.items.find((cartItem) => cartItem.product.equals(product._id));
    const newQuantity = (item?.quantity ?? 0) + amount;
    checkStock(product, newQuantity);

    if (item) {
      item.quantity = newQuantity;
    } else {
      cart.items.push({ product: product._id, quantity: amount });
    }
    await cart.save();

    await sendCart(res, cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Səbətdəki məhsulun miqdarını dəyişmək
// @route   PUT /api/cart/:productId   body: { quantity }
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const quantity = readQuantity(req.body?.quantity);
    const product = await findProduct(req.params.productId);

    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.find((cartItem) => cartItem.product.equals(product._id));
    if (!item) {
      throw new ApiError(404, "This product is not in your cart");
    }

    checkStock(product, quantity);
    item.quantity = quantity;
    await cart.save();

    await sendCart(res, cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Məhsulu səbətdən çıxarmaq
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
      throw new ApiError(400, "A valid productId is required");
    }

    const cart = await Cart.findOne({ user: req.user._id });
    const inCart = cart?.items.some((cartItem) => cartItem.product.equals(productId));
    if (!inCart) {
      throw new ApiError(404, "This product is not in your cart");
    }

    cart.items = cart.items.filter((cartItem) => !cartItem.product.equals(productId));
    await cart.save();

    await sendCart(res, cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Səbəti tam boşaltmaq
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    await sendCart(res, null);
  } catch (error) {
    next(error);
  }
};
