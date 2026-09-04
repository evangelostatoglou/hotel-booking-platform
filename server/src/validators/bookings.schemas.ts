import { z } from "zod";

export function getToday():string{
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateRangeSchema = z
  .object({
    checkIn: z.iso.date({
      error: "Check-in must be a valid date"
    }),

    checkOut: z.iso.date({
      error: "Check-out must be a valid date"
    })
  })
  .refine(
    data => data.checkIn > getToday(),
    {
      message: "Check-in must not be in the past",
      path: ["checkOut"]
    }
  )
  .refine(
    data => data.checkOut > data.checkIn,
    {
      message: "Check-out must be after check-in",
      path: ["checkOut"]
    }
  );

export const bookingAvailabilitySchema = dateRangeSchema.safeExtend({
    rooms: z
      .array(
        z.object({
          roomTypeId: z
            .number()
            .int()
            .positive(),

          quantity: z
            .number()
            .int()
            .min(1)
            .max(10)
        })
      )
      .min(1, "At least one room type is required")
      .max(10, "Too many room types")
      .refine(
        rooms =>
          new Set(
            rooms.map(room => room.roomTypeId)
          ).size === rooms.length,
        {
          message:
            "Each room type can appear only once",
          path: ["rooms"]
        }
      )
  });

  export const bookingCreationSchema =
  bookingAvailabilitySchema.safeExtend({
    adults: z.number().int().positive().min(1),
    children: z.number().int().min(0),

    specialRequest: z
      .string()
      .trim()
      .max(400)
      .nullable()
      .default(null)
  });

export type BookingAvailabilityInput = z.infer<typeof bookingAvailabilitySchema>;
export type BookingCreationInput = z.infer<typeof bookingCreationSchema>;
