import mongoose from "mongoose";

// Footer-dəki "Newsletter" formuna yazılan email-lər (hər email bir dəfə)
const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, "Email is too long"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
