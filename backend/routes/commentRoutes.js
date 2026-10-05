import { Router } from "express";
import { listComments, listAllComments, createComment, deleteComment } from "../controllers/commentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { commentLimiter } from "../middleware/rateLimitMiddleware.js";

// app.js-də "/api/comments" altında qoşulur. Oxumaq hamıya açıqdır, yazmaq üçün giriş lazımdır.
const router = Router();

router.get("/", listComments);
router.get("/all", protect, admin, listAllComments);
router.post("/", commentLimiter, protect, createComment);
router.delete("/:id", protect, deleteComment);

export default router;
