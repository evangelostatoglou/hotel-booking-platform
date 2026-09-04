import { Router } from "express";
import rateLimit from "express-rate-limit";
import { m_requireAuth } from "../middleware/auth.middleware";
import { c_createBooking, c_getAllMyBookings, c_getRoomAvailability } from "../controllers/booking.controller";

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

// '/booking' path from app
router.post("/", bookingLimiter, m_requireAuth, c_createBooking);
router.get("/", bookingLimiter);
router.post("/availability", c_getRoomAvailability);
router.get("/me", bookingLimiter, m_requireAuth, c_getAllMyBookings);

export default router;