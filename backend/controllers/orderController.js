import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";
import { isObjectId, roundPrice } from "../utils/helpers.js";

/*
  Gələn [{ product, quantity }] siyahısından sifariş sətirləri düzəldir.
  Qiymət, ad və şəkil BAZADAN götürülür – frontend-in göndərdiyi qiymətə etibar edilmir.
*/
const buildOrderItems = async (requestedItems) => {
  // eyni məhsul iki dəfə gələrsə miqdarlar birləşdirilir
  const quantities = new Map();
  for (const item of requestedItems) {
    const { product, quantity } = item ?? {};
    const id = String(product);

    if (!isObjectId(id)) {
      throw new ApiError(400, "Each order item needs a valid product id");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "Each order item needs a whole-number quantity of at least 1");
    }
    quantities.set(id, (quantities.get(id) ?? 0) + quantity);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  if (products.length !== quantities.size) {
    throw new ApiError(404, "One or more products were not found");
  }

  return products.map((product) => ({
    product: product._id,
    title: product.title,
    image: product.image,
    price: product.price,
    quantity: quantities.get(String(product._id)),
  }));
};

// stoku geri qaytarır (sifariş ləğv olunanda və ya yarımçıq qalanda)
const releaseStock = (items) =>
  Promise.all(
    items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }))
  );

/*
  Hər məhsulun stokunu azaldır. "stock >= quantity" şərti bazada yoxlanılır,
  ona görə iki nəfər eyni anda son yeri ala bilməz. Hər hansı məhsulda stok
  çatmasa, artıq azaldılanlar geri qaytarılır – ya hamısı, ya heç biri.
*/
const reserveStock = async (items) => {
  const reserved = [];
  try {
    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        throw new ApiError(400, `Not enough stock for ${item.title}`);
      }
      reserved.push(item);
    }
  } catch (error) {
    await releaseStock(reserved);
    throw error;
  }
};

// @desc    Yeni sifariş. orderItems göndərilməsə, istifadəçinin səbətindən yaradılır.
// @route   POST /api/orders   body: { shippingAddress, orderItems?: [{ product, quantity }] }
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress } = req.body ?? {};
    const fromCart = orderItems === undefined;

    let requested;
    if (fromCart) {
      const cart = await Cart.findOne({ user: req.user._id });
      requested = cart?.items ?? [];
    } else {
      if (!Array.isArray(orderItems)) {
        throw new ApiError(400, "orderItems must be an array");
      }
      requested = orderItems;
    }

    if (requested.length === 0) {
      throw new ApiError(400, fromCart ? "Your cart is empty" : "orderItems cannot be empty");
    }

    const items = await buildOrderItems(requested);
    const totalPrice = roundPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

    // əvvəlcə ünvan və s. yoxlanılır ki, səhv sorğu stoku boş yerə azaltmasın
    const order = new Order({ user: req.user._id, orderItems: items, shippingAddress, totalPrice });
    await order.validate();

    await reserveStock(items);
    try {
      await order.save();
    } catch (error) {
      await releaseStock(items);
      throw error;
    }

    if (fromCart) {
      await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Daxil olmuş istifadəçinin sifarişləri (ən yenisi birinci)
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Bir sifariş – sahibi və ya admin görə bilər
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const isOwner = order.user?._id.equals(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "You can only view your own orders");
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Bütün sifarişlər (?status=Pending ilə filtr)
// @route   GET /api/orders
// @access  Admin
export const getOrders = async (req, res, next) => {
  try {
    const filter = ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate("user", "name email");

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Sifarişin statusunu dəyişmək
// @route   PUT /api/orders/:id/status   body: { status }
// @access  Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    if (!ORDER_STATUSES.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${ORDER_STATUSES.join(", ")}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // çatdırılmış və ya ləğv olunmuş sifariş artıq dəyişmir
    if (order.status === "Delivered" || order.status === "Cancelled") {
      throw new ApiError(400, `Order is already ${order.status} and cannot be changed`);
    }

    // ləğv olunanda alınmış yerlər (stok) geri qaytarılır
    if (status === "Cancelled") {
      await releaseStock(order.orderItems);
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
