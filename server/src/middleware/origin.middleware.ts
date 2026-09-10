import { NextFunction, Request, Response } from "express";

const clientOrigin = new URL(
  process.env.CLIENT_ORIGIN ?? "http://localhost:5173"
).origin;

export function requireTrustedOrigin(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get("origin");

  if (origin && origin !== clientOrigin) {
    res.status(403).json({ message: "Request origin is not allowed" });
    return;
  }

  next();
}
