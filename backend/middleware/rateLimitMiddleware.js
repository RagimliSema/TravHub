import rateLimit from "express-rate-limit";

/*
  Login/register üçün: eyni IP-dən 15 dəqiqədə ən çox 20 UĞURSUZ cəhd.
  Şifrəni təxmin etməyə çalışan proqramın qarşısını alır.
  Avtomatik testlərdə söndürülür.
*/
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

/*
  "Forgot Password": cavab həmişə uğurludur, ona görə HƏR sorğu sayılır –
  eyni IP-dən 15 dəqiqədə ən çox 5 reset məktubu (başqasının poçtunu doldurmasınlar).
*/
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many reset requests, please try again in 15 minutes" },
});

// Contact formu: eyni IP-dən 15 dəqiqədə ən çox 5 mesaj (spam əleyhinə)
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many messages, please try again in 15 minutes" },
});

// Newsletter: eyni IP-dən 15 dəqiqədə ən çox 5 email
export const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

// Şərhlər: eyni IP-dən 15 dəqiqədə ən çox 20 şərh / cavab
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many comments, please try again in 15 minutes" },
});
