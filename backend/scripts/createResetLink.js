/*
  Development: şifrə sıfırlama linkini TERMİNALA yazır (SMTP qurulmayanda email əvəzinə).
  İstifadə:  npm run reset-link -- sizin@email.com

  - "Forgot Password"-un email-ə qoyduğu linkin eynisini yaradır (15 dəqiqə, bir dəfəlik).
  - Yeni şifrə brauzerdə, mövcud "Reset Password" səhifəsində seçilir – terminalda şifrə olmur.
  - Hesabın rolu, wishlist-i, səbəti və sifarişləri dəyişmir; yalnız reset tokeni yazılır.
  - Bazaya girişi olan şəxs işlədə bilər (make-admin kimi); production-da işləmir.
*/
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User, { RESET_TOKEN_MINUTES } from "../models/User.js";
import { clientUrl } from "../utils/helpers.js";

if (process.env.NODE_ENV === "production") {
  console.error("reset-link is a local development tool. In production use Forgot Password with SMTP configured.");
  process.exit(1);
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run reset-link -- your@email.com");
  process.exit(1);
}

await connectDB();

const user = await User.findOne({ email });

if (!user) {
  console.error(`No user found with email: ${email}`);
  process.exitCode = 1;
} else {
  // yalnız passwordResetToken (hash) və passwordResetExpires yazılır; əvvəlki link etibarsız olur
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log(
    `\nPassword reset link for ${user.email} (valid ${RESET_TOKEN_MINUTES} minutes, works once):\n\n` +
      `  ${clientUrl()}/reset-password/${token}\n\n` +
      "Open it in the browser (frontend must be running) and choose a new password.\n"
  );
}

await mongoose.disconnect();
