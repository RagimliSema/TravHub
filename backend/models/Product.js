import mongoose from "mongoose";

/*
  Məhsul modeli: bazada "products" kolleksiyası.
  TravHub-da məhsul = satılan tur paketi (stock = qalan yer sayı).
*/
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot be longer than 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot be longer than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category cannot be longer than 50 characters"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
    // şəkil ünvanı (URL və ya fayl adı)
    image: {
      type: String,
      trim: true,
      default: "",
    },
    // turun məkanı – kartda 📍 ilə göstərilir (məs. "Rome")
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Location cannot be longer than 100 characters"],
    },
    // endirim faizi – kartda "40% off" nişanı (0 = endirim yoxdur)
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot be more than 100"],
    },
    // neçə istifadəçi wishlist-ə əlavə edib – yalnız like sistemi dəyişir, admin yox
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // createdAt və updatedAt
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// kateqoriyaya görə filtr və qiymətə görə sıralama tez işləsin
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
