import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware";
import { createBooking, getAllMyBookings, getRoomAvailability } from "../controllers/booking.controller";

const router = Router();

const bookingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});

router.post("/", bookingLimiter, requireAuth, createBooking);
router.get("/", bookingLimiter);
router.post("/availability", getRoomAvailability);
router.get("/me", bookingLimiter, requireAuth, getAllMyBookings);

export default router;
