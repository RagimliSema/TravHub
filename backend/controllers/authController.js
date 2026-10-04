import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";

// dəyər boş olmayan mətn olmalıdır (obyekt, rəqəm və s. qəbul olunmur)
const isFilled = (value) => typeof value === "string" && value.trim() !== "";

// register və login eyni formatda cavab qaytarır: token + istifadəçi
const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    success: true,
    token: generateToken(user._id),
    user,
  });
};

// @desc    Yeni istifadəçi qeydiyyatı
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    // yalnız bu 3 sahə götürülür – "role": "admin" göndərilsə belə nəzərə alınmır
    const { name, email, password } = req.body ?? {};

    if (!isFilled(name) || !isFilled(email) || !isFilled(password)) {
      throw new ApiError(400, "Please provide name, email and password");
    }

    if (await User.exists({ email })) {
      throw new ApiError(409, "User with this email already exists");
    }

    // şifrə User modelindəki pre("save") ilə hash-lənir
    const user = await User.create({ name, email, password });

    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Giriş
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!isFilled(email) || !isFilled(password)) {
      throw new ApiError(400, "Please provide email and password");
    }

    // şifrə default gizlidir (select: false) – müqayisə üçün açıq istəyirik
    const user = await User.findOne({ email }).select("+password");

    // email, yoxsa şifrə səhvdir – demirik ki, kimsə hansı email-lərin qeydiyyatda olduğunu yoxlaya bilməsin
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Daxil olmuş istifadəçinin məlumatları
// @route   GET /api/auth/me
// @access  Private (protect istifadəçini artıq req.user-ə yazıb)
export const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};
