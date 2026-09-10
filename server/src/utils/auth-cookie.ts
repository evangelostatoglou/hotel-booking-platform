import type { CookieOptions } from "express";
import { getJwtMaxAgeMs } from "./jwt";

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getJwtMaxAgeMs()
  };
}
