import ApiError from "../utils/ApiError.js";

// heç bir route-a uyğun gəlməyən sorğu → 404
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found - ${req.originalUrl}`));
};

/*
  Bütün xətalar buraya gəlir və eyni formatda qaytarılır:
  { success: false, message, errors? }
  Express xəta middleware-ini 4 parametrindən tanıyır, ona görə _next qalmalıdır.
*/
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors;

  // yanlış ObjectId, məs. /api/products/123
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // unique sahə təkrarlanır, məs. eyni email ilə ikinci qeydiyyat
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    statusCode = 409;
    message = `${field} already exists`;
  }

  // schema validasiyası (required, min, enum və s.)
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors.map((e) => e.message).join(", ");
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please log in again";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please log in again";
  }

  // express.json() sorğunun gövdəsini oxuya bilmədi
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // gözlənilməz xətalar: logla, production-da detalını gizlət
  const isProduction = process.env.NODE_ENV === "production";
  if (statusCode === 500) {
    console.error(err);
    if (isProduction) message = "Server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(statusCode === 500 && !isProduction && { stack: err.stack }),
  });
};
