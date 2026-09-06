import type { RoomType, User } from "../api";

export const placeholderImage = "/images/rooms/double-room.jpg";

export function parsePrice(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;

  // Removes currency symbols and commas from values such as "$240.00".
  const price = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(price) ? price : null;
}

export function getRoomPrice(room: RoomType) {
  return parsePrice(room.price);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function formatBookingDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";

  // Backend dates may be date-only values or full date-time values.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getNumberOfNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;

  // UTC keeps the calculation accurate when daylight-saving time changes.
  const startDate = Date.parse(`${checkIn}T00:00:00Z`);
  const endDate = Date.parse(`${checkOut}T00:00:00Z`);
  const millisecondsPerNight = 1000 * 60 * 60 * 24;

  return (endDate - startDate) / millisecondsPerNight;
}

export function getUserInitials(user: User) {
  const firstInitial = user.firstName?.trim().charAt(0) ?? "";
  const lastInitial = user.lastName?.trim().charAt(0) ?? "";
  const initials = firstInitial + lastInitial;
  const emailInitial = user.email?.charAt(0) ?? "U";

  return (initials || emailInitial).toUpperCase();
}
