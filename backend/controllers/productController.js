import Product from "../models/Product.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";
import { pick, escapeRegex, toPositiveInt } from "../utils/helpers.js";

// admin-in yarada/dəyişə biləcəyi sahələr. likesCount burada yoxdur –
// o yalnız like sistemi ilə dəyişir.
const EDITABLE_FIELDS = [
  "title",
  "description",
  "price",
  "category",
  "stock",
  "image",
  "location",
  "discount",
];

// sonda _id: eyni dəyərli məhsulların sırası sabit qalsın ki,
// səhifələmədə məhsul iki dəfə görünməsin və ya itməsin
const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: -1 },
  price_desc: { price: -1, _id: -1 },
  popular: { likesCount: -1, _id: -1 },
};

// query dəyəri mətn deyilsə (məs. ?category=a&category=b massiv olur) nəzərə alınmır
const queryText = (value) => (typeof value === "string" ? value.trim() : "");

const queryNumber = (value) => {
  const text = queryText(value);
  return text === "" ? NaN : Number(text);
};

// @desc    Məhsullar siyahısı: axtarış, filtr, sıralama, səhifələmə
// @route   GET /api/products?search=&category=&minPrice=&maxPrice=&inStock=true&sort=&page=&limit=
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const filter = {};

    // axtarış həm adda, həm məkanda: "Australia" → Great Barrier Reef.
    // Sözlər arasındakı artıq boşluq nəzərə alınmır: "new   york" = "New York"
    const search = queryText(req.query.search).replace(/\s+/g, " ");
    if (search) {
      const words = search.split(" ").map(escapeRegex);
      const pattern = { $regex: words.join("\\s+"), $options: "i" };
      filter.$or = [{ title: pattern }, { location: pattern }];
    }

    // kateqoriya: böyük/kiçik hərf fərq etmir, amma ad tam uyğun gəlməlidir
    const category = queryText(req.query.category);
    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
    }

    const minPrice = queryNumber(req.query.minPrice);
    const maxPrice = queryNumber(req.query.maxPrice);
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      filter.price = {};
      if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
      if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;
    }

    if (req.query.inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    const sortKey = queryText(req.query.sort);
    const sort = Object.hasOwn(SORT_OPTIONS, sortKey) ? SORT_OPTIONS[sortKey] : SORT_OPTIONS.newest;

    const limit = Math.min(toPositiveInt(req.query.limit, 12), 50);
    const page = toPositiveInt(req.query.page, 1);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bütün kateqoriyalar (frontend-də filtr düymələri üçün)
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = (await Product.distinct("category")).sort();

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Bir məhsul
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Yeni məhsul
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(pick(req.body, EDITABLE_FIELDS));

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Məhsulu yeniləmək (yalnız göndərilən sahələr dəyişir)
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    Object.assign(product, pick(req.body, EDITABLE_FIELDS));
    await product.save(); // save() schema qaydalarını yenidən yoxlayır

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Məhsulu silmək
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    await product.deleteOne();

    // silinmiş məhsul wishlist-lərdə və səbətlərdə qalmasın.
    // Sifarişlərə toxunulmur – onlarda məhsulun surəti saxlanılır.
    await Promise.all([
      User.updateMany({ savedProducts: product._id }, { $pull: { savedProducts: product._id } }),
      Cart.updateMany({ "items.product": product._id }, { $pull: { items: { product: product._id } } }),
    ]);

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};
