import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", // allows requests from my react client or it guesses its on port 5173
    credentials: true // allows cookies to be transfered via HTTP
  })
);
app.use(express.json()); //extracts the data from the body since request is JSON
app.use(cookieParser());//reads cookies and we can access with req.cookies
app.use(morgan("dev"));//logs all requests in the terminal



app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Hotel booking API is online"
  });
});

app.use('/auth', authRouter);

export default app;