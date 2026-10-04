import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// şifrə sıfırlama linki neçə dəqiqə etibarlıdır
export const RESET_TOKEN_MINUTES = 15;

// reset tokeni bazada açıq yox, SHA-256 hash kimi saxlanılır (baza oğurlansa da link işləməsin)
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/*
  İstifadəçi modeli: bazada "users" kolleksiyası.
  Schema hər sahənin tipini və qaydalarını təyin edir –
  qaydaya uymayan məlumat bazaya yazılmır (errorHandler 400 qaytarır).
*/
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be longer than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // eyni email ilə iki hesab ola bilməz
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      // Google / Facebook ilə yaranan hesabın şifrəsi olmur – saxta şifrə saxlanmır
      required: [
        function () {
          return !this.googleId && !this.facebookId;
        },
        "Password is required",
      ],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [64, "Password cannot be longer than 64 characters"],
      select: false, // sorğularda default olaraq bazadan gətirilmir
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // sosial giriş: Google / Facebook-un bu istifadəçiyə verdiyi daimi id
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    // wishlist: bəyənilən məhsulların id-ləri (Product modeli Mərhələ 3-də)
    savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // şifrə sıfırlama: tokenin hash-i və bitmə vaxtı (istifadədən sonra silinir)
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // şifrə dəyişəndə – bundan əvvəl verilmiş JWT-lər qəbul edilmir
    passwordChangedAt: { type: Date, select: false },
  },
  {
    timestamps: true, // createdAt və updatedAt avtomatik əlavə olunur
    toJSON: {
      // istifadəçi cavab kimi göndəriləndə şifrə, sosial id-lər və reset məlumatı görünməsin
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.googleId;
        delete ret.facebookId;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// bazaya yazmazdan əvvəl şifrəni hash-lə (yalnız şifrə yeni və ya dəyişibsə)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // mövcud hesabın şifrəsi dəyişdi → köhnə sessiyalar (JWT-lər) bağlanır.
  // 1 saniyə geri: dərhal sonra verilən yeni token rədd edilməsin
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

// təsadüfi reset tokeni yaradır: açıq token email-ə gedir, bazada yalnız hash-i qalır
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = hashToken(token);
  this.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);
  return token;
};

// girişdə yazılan şifrəni bazadakı hash ilə müqayisə edir → true / false
// (yalnız sosial girişlə yaranan hesabın şifrəsi yoxdur → həmişə false)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
