import mongoose from "mongoose";

/*
  Bloq yazısına şərh. post – yazının qısa adı (slug), məs. "katie-stewart-net-zero".
  parent boşdursa əsas şərhdir, doludursa həmin şərhə cavabdır (yalnız bir səviyyə).
  name – yazan anda istifadəçinin adı: hesab silinsə də şərhin müəllifi görünür.
*/
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: String,
      required: [true, "Post is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Post id is too long"],
      match: [/^[a-z0-9-]+$/, "Invalid post id"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    text: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      maxlength: [1000, "Comment cannot be longer than 1000 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
