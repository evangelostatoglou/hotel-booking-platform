import jwt, {type SignOptions} from "jsonwebtoken";
import {TokenUser, getJwtDuration, getJwtSecret, verifyJWT} from "../utils/jwt";
import { NextFunction, Request, Response } from "express";

export function requireAuth (req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.access_token;

  if (typeof token !== "string") {
    res.status(401).json({
      message: "Authentication required"
    });

    return;
  }

  try {
    const user = verifyJWT(token);

    res.locals.auth = user;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
};





