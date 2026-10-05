import { Router } from "express";
import { sendContactMessage } from "../controllers/contactController.js";
import { contactLimiter } from "../middleware/rateLimitMiddleware.js";

// app.js-də "/api/contact" altında qoşulur
const router = Router();

router.post("/", contactLimiter, sendContactMessage);

export default router;
