import { Request, Response } from "express";
import { bookingAvailabilitySchema, bookingCreationSchema } from "../validators/bookings.schemas";
import z from "zod";
import { areRoomsAvailable, createBooking as createBookingService, getAllMyBookings as getAllMyBookingsService } from "../services/booking.service";




export async function getRoomAvailability(req: Request, res: Response):Promise<void>{
    
    const validation = bookingAvailabilitySchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({message: "Invalid Input zod bookings room type id", errors: z.flattenError(validation.error).fieldErrors});
        return;
    }
    

    const availability  = await areRoomsAvailable(validation.data);
    if(!availability){res.status(200).json({availability: false});}
    else {res.status(200).json({availability: true});}
    return;
}

export async function createBooking(req: Request, res: Response):Promise<void>{
    const validation = bookingCreationSchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({message: "Invalid Input zod bookings room type id", errors: z.flattenError(validation.error).fieldErrors});
        return;
    }

    const bookingId = await createBookingService(validation.data, res.locals.auth.id);
    res.status(201).json({message: "Booking confirmed", bookingId});
    return;

}


export async function getAllMyBookings(req: Request, res: Response):Promise<void>{
    
    const bookings = await getAllMyBookingsService(res.locals.auth.id);
    res.status(200).json({bookings});
    return;
}



