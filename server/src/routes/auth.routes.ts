import { Router } from "express";
import { login } from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";

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

router.post("/login", loginLimiter, login);

export default router;