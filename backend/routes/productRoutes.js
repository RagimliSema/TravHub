import { Router } from "express";
import {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { toggleLike } from "../controllers/wishlistController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// app.js-də "/api/products" altında qoşulur
const router = Router();

// baxmaq hamıya açıqdır, dəyişmək yalnız adminə
router.route("/").get(getProducts).post(protect, admin, createProduct);

// "/categories" "/:id"-dən ƏVVƏL olmalıdır, yoxsa "categories" id kimi oxunar
router.get("/categories", getCategories);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.post("/:id/like", protect, toggleLike);

export default router;
