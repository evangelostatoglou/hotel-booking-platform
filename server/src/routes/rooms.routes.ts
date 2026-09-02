import { Router } from "express";
import rateLimit from "express-rate-limit";
import { c_getAllRoomTypes, c_getRoomType } from "../controllers/rooms.controller";

const router = Router();

const roomLimiter = rateLimit({ //we limit login requests to 2 per minute per client
  windowMs: 1 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});


// router.post("/login", loginLimiter, login);
router.get("/", c_getAllRoomTypes);
router.get("/:slug", c_getRoomType);



export default router;