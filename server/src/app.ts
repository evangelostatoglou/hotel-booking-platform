import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";
import bookingsRouter from "./routes/booking.routes";
import roomsRouter from "./routes/rooms.routes";
import { errorHandler } from "./middleware/error_handler.middleware";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));



app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Hotel booking API is online"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use('/auth', authRouter);
app.use('/bookings', bookingsRouter);
app.use('/rooms', roomsRouter);


app.use(errorHandler);

export default app;
