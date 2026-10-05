import ContactMessage from "../models/ContactMessage.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { pick } from "../utils/helpers.js";
import { sendEmail } from "../utils/sendEmail.js";

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const contactEmail = ({ name, email, message }) => ({
  subject: `New message from ${name} – TravHub`,
  text: `${name} <${email}> wrote via the TravHub contact form:\n\n${message}\n\nReply to this email to answer.`,
  html:
    `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) wrote via the TravHub contact form:</p>` +
    `<p style="white-space:pre-line">${escapeHtml(message)}</p>` +
    `<p>Reply to this email to answer.</p>`,
});

// @desc    Contact formu: mesaj bazada saxlanılır və adminlərin email-inə göndərilir
// @route   POST /api/contact   body: { name, email, message }
// @access  Public
export const sendContactMessage = async (req, res, next) => {
  try {
    const data = pick(req.body, ["name", "email", "message"]);
    if (Object.values(data).some((value) => typeof value !== "string")) {
      throw new ApiError(400, "Invalid form data");
    }

    const saved = await ContactMessage.create(data);

    // məktub alınmasa da mesaj itmir – bazada qalır
    try {
      const admins = await User.find({ role: "admin" }).select("email").lean();
      if (admins.length) {
        await sendEmail({
          to: admins.map((admin) => admin.email).join(", "),
          replyTo: { name: saved.name, address: saved.email },
          ...contactEmail(saved),
        });
      }
    } catch (error) {
      console.error("Contact email failed:", error.message);
    }

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent. We will reply to your email soon.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Contact mesajları (ən yenisi birinci)
// @route   GET /api/contact
// @access  Private/Admin
export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Contact mesajını sil
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContactMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) throw new ApiError(404, "Message not found");
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};
