// The backend runs on port 5000 by default.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string | null;
};

export type RoomType = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  capacityAdults: number | null;
  capacityChildren: number | null;
  price: string | null;
  bedType: string | null;
  sizeM2: number | null;
  imageUrl: string;
};

export type Amenity = {
  id: number;
  name: string | null;
  description: string | null;
};

export type RoomDetails = RoomType & {
  amenities: Amenity[];
  imageUrls: { imageUrl: string }[];
};

export type BookingRoom = {
  roomTypeId: number;
  quantity: number;
};

export type Booking = {
  id: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: "pending" | "confirmed" | "cancelled";
  price: number | string | null;
  createdAt: string;
  specialRequest: string | null;
};

export type BookingAvailabilityRequest = {
  checkIn: string;
  checkOut: string;
  rooms: BookingRoom[];
};

export type BookingRequest = BookingAvailabilityRequest & {
  adults: number;
  children: number;
  specialRequest: string | null;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
};

export type ValidationErrors = Record<string, string[]>;

// Keeps both the general error and field-specific validation messages.
export class ApiError extends Error {
  errors?: ValidationErrors;

  constructor(message: string, errors?: ValidationErrors) {
    super(message);
    this.name = "ApiError";
    this.errors = errors;
  }
}

// This helper keeps fetch setup in one place.
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(API_URL + path, {
    ...options,
    credentials: "include", // Sends the authentication cookie.
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Something went wrong", data?.errors);
  }

  return data as T;
}

export async function getRooms(): Promise<RoomType[]> {
  const data = await apiRequest<{ result: RoomType[] }>("/rooms");
  return data.result;
}

export async function getRoom(slug: string): Promise<RoomDetails> {
  const data = await apiRequest<{ result: RoomDetails }>("/rooms/" + slug);
  return data.result;
}

export function loginUser(email: string, password: string) {
  return apiRequest<{ user: User }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerUser(user: Record<string, unknown>) {
  return apiRequest<{ user: User }>("/auth/register", {
    method: "POST",
    body: user,
  });
}

export async function getCurrentUser(): Promise<User> {
  const data = await apiRequest<{ user: User }>("/auth/me");
  return data.user;
}

export function logoutUser() {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export function checkBookingAvailability(booking: BookingAvailabilityRequest) {
  return apiRequest<{ availability: boolean }>("/bookings/availability", {
    method: "POST",
    body: booking as unknown as Record<string, unknown>,
  });
}

export function createBooking(booking: BookingRequest) {
  return apiRequest<{ message: string; bookingId: number }>("/bookings", {
    method: "POST",
    body: booking as unknown as Record<string, unknown>,
  });
}

export async function getMyBookings(): Promise<Booking[]> {
  const data = await apiRequest<{ bookings: Booking[] }>("/bookings/me");
  return data.bookings;
}
