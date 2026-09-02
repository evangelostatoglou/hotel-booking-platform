import { Router } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

const bookingLimiter = rateLimit({ //we limit login requests to 2 per minute per client
  windowMs: 1 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});


// router.post("/login", loginLimiter, login);

export default router;