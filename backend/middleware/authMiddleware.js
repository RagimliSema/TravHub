import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/*
  Yalnız daxil olmuş istifadəçiləri buraxır.
  Sorğuda "Authorization: Bearer <token>" başlığı olmalıdır.
  Uğurlu olsa, istifadəçi req.user-ə yazılır və növbəti addıma keçilir.
*/
export const protect = async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Not authorized, no token");
    }

    // token saxtadırsa və ya vaxtı keçibsə jwt.verify xəta atır → errorHandler 401 qaytarır
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

    // token düzgündür, amma istifadəçi artıq silinmiş ola bilər
    const user = await User.findById(decoded.id).select("+passwordChangedAt");
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists");
    }

    // şifrə tokendən SONRA dəyişibsə (məs. "Forgot Password" ilə), köhnə token qəbul edilmir
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      throw new ApiError(401, "Password was changed. Please log in again");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// protect-dən SONRA işləyir: yalnız admin rolu olanları buraxır
export const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  next(new ApiError(403, "Access denied: admins only"));
};
