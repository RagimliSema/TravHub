import { Router } from "express";
import { getUsers, getUserById, deleteUser } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// app.js-də "/api/users" altında qoşulur
const router = Router();

// bu fayldakı bütün route-lar: əvvəl giriş yoxlanılır (protect), sonra admin rolu (admin)
router.use(protect, admin);

router.get("/", getUsers);
router.route("/:id").get(getUserById).delete(deleteUser);

export default router;
