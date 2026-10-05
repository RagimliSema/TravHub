import { Router } from "express";
import { sendContactMessage, getContactMessages, deleteContactMessage } from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { contactLimiter } from "../middleware/rateLimitMiddleware.js";

// app.js-də "/api/contact" altında qoşulur. Göndərmək hamıya açıqdır, oxumaq yalnız admin üçün.
const router = Router();

router.post("/", contactLimiter, sendContactMessage);
router.get("/", protect, admin, getContactMessages);
router.delete("/:id", protect, admin, deleteContactMessage);

export default router;
