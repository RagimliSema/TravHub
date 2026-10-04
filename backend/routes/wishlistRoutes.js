import { Router } from "express";
import { getWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

// app.js-də "/api/wishlist" altında qoşulur.
// Əlavə etmək / çıxarmaq: POST /api/products/:id/like
const router = Router();

router.get("/", protect, getWishlist);

export default router;
