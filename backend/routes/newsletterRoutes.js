import { Router } from "express";
import { subscribe, getSubscribers, deleteSubscriber } from "../controllers/newsletterController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { newsletterLimiter } from "../middleware/rateLimitMiddleware.js";

// app.js-də "/api/newsletter" altında qoşulur. Yazılmaq hamıya açıqdır, siyahı yalnız admin üçün.
const router = Router();

router.post("/", newsletterLimiter, subscribe);
router.get("/", protect, admin, getSubscribers);
router.delete("/:id", protect, admin, deleteSubscriber);

export default router;
