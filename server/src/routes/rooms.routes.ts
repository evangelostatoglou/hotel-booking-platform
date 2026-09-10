import { Router } from "express";
import { getAllRoomTypes, getRoomType } from "../controllers/rooms.controller";

const router = Router();
router.get("/", getAllRoomTypes);
router.get("/:slug", getRoomType);



export default router;
