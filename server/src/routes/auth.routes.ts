import { Router } from "express";
import { c_login, c_logout, c_getCurrentUser, c_registerUser } from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";
import { requireAuth as m_requireAuth } from "../middleware/auth.middleware";

// here we will route all the AUTH requests that have to do with the users and changes on them

const router = Router();

const loginLimiter = rateLimit({ //we limit login requests to 2 per minute per client
  windowMs: 1 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});

const registerLimiter = rateLimit({ //we limit sign-up requests to 1 per minute per client
  windowMs: 1 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Try again later."
  }
});

const generalAuthLimiter = rateLimit({ //we limit sign-up requests to 1 per minute per client
  windowMs: 1 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Try again later."
  }
});





router.post("/login", loginLimiter, c_login);
router.get("/me", generalAuthLimiter, m_requireAuth, c_getCurrentUser);
router.post("/logout", loginLimiter, c_logout);
router.post("/register", generalAuthLimiter, c_registerUser);

export default router;