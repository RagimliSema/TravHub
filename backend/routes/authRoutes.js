import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { getProviders, startOAuth, oauthCallback } from "../controllers/oauthController.js";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimitMiddleware.js";

// app.js-də "/api/auth" altında qoşulur
const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);

// şifrə sıfırlama (email-ə bir dəfəlik, 15 dəqiqəlik link)
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

// sosial giriş (Google / Facebook) – açarlar backend/.env-dədir
router.get("/providers", getProviders);
router.get("/google", startOAuth("google"));
router.get("/google/callback", authLimiter, oauthCallback("google"));
router.get("/facebook", startOAuth("facebook"));
router.get("/facebook/callback", authLimiter, oauthCallback("facebook"));

export default router;
