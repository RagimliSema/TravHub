import Subscriber from "../models/Subscriber.js";
import ApiError from "../utils/ApiError.js";

const SUBSCRIBED = "Thank you! You are subscribed.";

// @desc    Newsletter-ə yazıl. Artıq yazılıbsa da eyni cavab (kimin yazıldığı bilinməsin)
// @route   POST /api/newsletter   body: { email }
// @access  Public
export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string") throw new ApiError(400, "Please enter a valid email");

    try {
      await Subscriber.create({ email });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }

    res.status(201).json({ success: true, message: SUBSCRIBED });
  } catch (error) {
    next(error);
  }
};

// @desc    Abunəçilər (ən yenisi birinci)
// @route   GET /api/newsletter
// @access  Private/Admin
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    next(error);
  }
};

// @desc    Abunəçini sil (məs. özü istəyəndə)
// @route   DELETE /api/newsletter/:id
// @access  Private/Admin
export const deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) throw new ApiError(404, "Subscriber not found");
    res.json({ success: true, message: "Subscriber removed" });
  } catch (error) {
    next(error);
  }
};
