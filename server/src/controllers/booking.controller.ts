import { NextFunction, Request, Response } from "express";
import { bookingAvailabilitySchema, bookingCreationSchema } from "../validators/bookings.schemas";
import z from "zod";
import { s_areRoomsAvailable, s_createBooking, s_getAllMyBookings } from "../services/booking.service";




export async function c_getRoomAvailability(req: Request, res: Response, next: NextFunction):Promise<void>{
    
    const validation = bookingAvailabilitySchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({message: "Invalid Input zod bookings room type id", errors: z.flattenError(validation.error).fieldErrors});
        return;
    }
    

    const availability  = await s_areRoomsAvailable(validation.data);
    if(!availability){res.status(200).json({availability: false});}
    else {res.status(200).json({availability: true});}
    return;
}

export async function c_createBooking(req: Request, res: Response, next: NextFunction):Promise<void>{
    const validation = bookingCreationSchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({message: "Invalid Input zod bookings room type id", errors: z.flattenError(validation.error).fieldErrors});
        return;
    }

    const booked  = await s_createBooking(validation.data, res.locals.auth.id);
    if(booked > 0){res.status(201).json({message: "Booking confirmed", bookingId: booked});}
    else if (booked === -1){res.status(400).json({message: "Wrong Booking Input"});}
    else if (booked === -2){res.status(409).json({message: "Not enough rooms available anymore for this request"});}
    else if (booked === -3){res.status(222).json({message: "Too many adults or children for the chosen rooms"});}
    else if (booked === -4){res.status(500).json({message: "Something went wrong in the db"});}
    return;

}


export async function c_getAllMyBookings(req: Request, res: Response, next: NextFunction):Promise<void>{
    
    const bookings = await s_getAllMyBookings(res.locals.auth.id);
    res.status(200).json({bookings});
    return;
}



