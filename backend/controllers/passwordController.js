import User, { RESET_TOKEN_MINUTES, hashToken } from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { clientUrl } from "../utils/helpers.js";
import { canSendEmail, sendEmail } from "../utils/sendEmail.js";

// email olsa da, olmasa da eyni cavab – kimsə hansı email-lərin qeydiyyatda olduğunu yoxlaya bilməsin
const GENERIC_MESSAGE =
  "If an account with that email exists, a password reset link has been sent. The link is valid for " +
  `${RESET_TOKEN_MINUTES} minutes.`;

// HTML məktubda ad istifadəçidən gəlir – "<", "&" kimi simvollar zərərsiz edilir
const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

const resetEmail = (name, resetUrl) => ({
  subject: "Reset your TravHub password",
  text:
    `Hello ${name},\n\n` +
    `We received a request to reset your TravHub password. Open this link to choose a new password:\n\n` +
    `${resetUrl}\n\n` +
    `The link is valid for ${RESET_TOKEN_MINUTES} minutes and can be used only once.\n` +
    `If you did not request this, you can ignore this email – your password will not change.`,
  html:
    `<p>Hello ${escapeHtml(name)},</p>` +
    `<p>We received a request to reset your TravHub password.</p>` +
    `<p><a href="${resetUrl}">Choose a new password</a></p>` +
    `<p>The link is valid for ${RESET_TOKEN_MINUTES} minutes and can be used only once.<br>` +
    `If you did not request this, you can ignore this email.</p>`,
});

// @desc    Şifrə sıfırlama linki istə
// @route   POST /api/auth/forgot-password   body: { email }
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      throw new ApiError(400, "Please provide your email");
    }

    // email xidməti yoxdursa (production) hamıya eyni xəta – istifadəçi axtarılmadan
    if (!canSendEmail()) {
      throw new ApiError(503, "Password reset is not available: the email service is not configured");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      const token = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false }); // yalnız token sahələri dəyişir

      const resetUrl = `${clientUrl()}/reset-password/${token}`;
      try {
        await sendEmail({ to: user.email, ...resetEmail(user.name, resetUrl) });
      } catch (error) {
        // göndərmək alınmadı → token silinir ki, istifadəsiz link qalmasın
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error("Password reset email failed:", error.message);
        throw new ApiError(500, "Could not send the reset email. Please try again later.");
      }
    }

    res.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    next(error);
  }
};

// @desc    Yeni şifrə təyin et (email-dəki linkdən)
// @route   POST /api/auth/reset-password/:token   body: { password }
// @access  Public (token ilə)
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body ?? {};
    if (typeof password !== "string" || !password) {
      throw new ApiError(400, "Please provide a new password");
    }

    // bazada tokenin hash-i saxlanılır – gələn tokeni hash-ləyib axtarırıq, vaxtı keçməmiş olmalıdır
    const user = await User.findOne({
      passwordResetToken: hashToken(req.params.token),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new ApiError(400, "This reset link is invalid or has expired. Please request a new one.");
    }

    // yeni şifrə: model yoxlayır (min 8), pre("save") bcrypt ilə hash-ləyir və
    // passwordChangedAt yazır → köhnə JWT-lər artıq qəbul edilmir. Token bir dəfəlikdir.
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Your password has been updated. You can now log in." });
  } catch (error) {
    next(error);
  }
};
