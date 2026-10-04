import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// app.js-də "/api/orders" altında qoşulur. Hamısı giriş tələb edir.
const router = Router();

router.use(protect);

router.route("/").post(createOrder).get(admin, getOrders);

// "/my-orders" "/:id"-dən ƏVVƏL olmalıdır
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", admin, updateOrderStatus);

export default router;
