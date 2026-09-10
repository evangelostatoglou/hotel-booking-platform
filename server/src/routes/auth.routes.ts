import { Router } from "express";
import { login, logout, getCurrentUser, registerUser } from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});

const generalAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Try again later."
  }
});





router.post("/login", loginLimiter, login);
router.get("/me", generalAuthLimiter, requireAuth, getCurrentUser);
router.post("/logout", loginLimiter, logout);
router.post("/register", generalAuthLimiter, registerUser);

export default router;
