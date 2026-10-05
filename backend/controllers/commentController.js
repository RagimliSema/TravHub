import Comment from "../models/Comment.js";
import ApiError from "../utils/ApiError.js";
import { isObjectId } from "../utils/helpers.js";

const POST_ID = /^[a-z0-9-]{1,100}$/;

const readPostId = (value) => {
  const post = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!POST_ID.test(post)) throw new ApiError(400, "Invalid post id");
  return post;
};

// frontend-ə gedən forma: email və s. göndərilmir, yalnız müəllifin id-si (öz şərhini silmək üçün)
const toJson = (comment) => ({
  _id: comment._id,
  user: comment.user,
  name: comment.name,
  text: comment.text,
  parent: comment.parent,
  createdAt: comment.createdAt,
});

// @desc    Yazının şərhləri: əsas şərhlər köhnədən yeniyə, hər birinin altında cavabları
// @route   GET /api/comments?post=<slug>
// @access  Public
export const listComments = async (req, res, next) => {
  try {
    const post = readPostId(req.query.post);
    const docs = await Comment.find({ post }).sort({ createdAt: 1, _id: 1 }).lean();

    const threads = new Map();
    for (const doc of docs) {
      if (!doc.parent) threads.set(String(doc._id), { ...toJson(doc), replies: [] });
    }
    for (const doc of docs) {
      if (doc.parent) threads.get(String(doc.parent))?.replies.push(toJson(doc));
    }

    res.json({ success: true, count: docs.length, comments: [...threads.values()] });
  } catch (error) {
    next(error);
  }
};

// @desc    Bütün yazıların bütün şərhləri (ən yenisi birinci) – müəllifin email-i ilə
// @route   GET /api/comments/all
// @access  Private/Admin
export const listAllComments = async (req, res, next) => {
  try {
    const docs = await Comment.find().sort({ createdAt: -1, _id: -1 }).limit(1000).populate("user", "email").lean();

    // əsas şərh silinəndə cavabları da silinir – admin bunu əvvəlcədən görsün
    const replyCounts = new Map();
    for (const doc of docs) {
      if (doc.parent) replyCounts.set(String(doc.parent), (replyCounts.get(String(doc.parent)) ?? 0) + 1);
    }

    const comments = docs.map((doc) => ({
      ...toJson({ ...doc, user: doc.user?._id ?? null }),
      post: doc.post,
      email: doc.user?.email ?? null, // hesab silinibsə null
      replies: replyCounts.get(String(doc._id)) ?? 0,
    }));

    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Şərh yaz və ya şərhə cavab ver (parent). Cavaba cavab eyni mövzuya düşür.
// @route   POST /api/comments   body: { post, text, parent? }
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { text, parent } = req.body ?? {};
    const post = readPostId(req.body?.post);
    if (typeof text !== "string") throw new ApiError(400, "Comment cannot be empty");

    let parentId = null;
    if (parent !== undefined && parent !== null && parent !== "") {
      if (!isObjectId(parent)) throw new ApiError(400, "Invalid comment id");
      const parentComment = await Comment.findOne({ _id: parent, post }).select("parent");
      if (!parentComment) throw new ApiError(404, "The comment you are replying to no longer exists");
      parentId = parentComment.parent ?? parentComment._id;
    }

    const comment = await Comment.create({
      post,
      text,
      parent: parentId,
      user: req.user._id,
      name: req.user.name,
    });

    res.status(201).json({ success: true, comment: { ...toJson(comment), replies: [] } });
  } catch (error) {
    next(error);
  }
};

// @desc    Şərhi sil (öz şərhini və ya admin istənilən şərhi). Əsas şərh silinəndə cavabları da silinir.
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new ApiError(404, "Comment not found");

    const isOwner = String(comment.user) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      throw new ApiError(403, "You can delete only your own comments");
    }

    const { deletedCount } = await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
    res.json({ success: true, deleted: deletedCount, message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};
