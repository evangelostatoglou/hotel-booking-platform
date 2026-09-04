import { BookingDetails, db_areRoomsAvailable, db_createBooking as db_createBooking, db_getAllMyBookings } from "../repositories/booking.repository";
import { BookingAvailabilityInput, BookingCreationInput } from "../validators/bookings.schemas";

export function calculateNights(checkIn: string, checkOut: string): number {

  const start = Date.parse(
    `${checkIn}T00:00:00Z`
  );

  const end = Date.parse(
    `${checkOut}T00:00:00Z`
  );

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );
}


export async function s_areRoomsAvailable(input: BookingAvailabilityInput, return_array?: boolean): Promise<boolean | number[]>{
    
    let temp;
    for(let i=0 ; i<input.rooms.length ; i++){
        temp = await db_areRoomsAvailable(input.rooms[i].roomTypeId, input.checkIn, input.checkOut);
        if (return_array) return temp; // optional use of the function to see for only 1 roomt type
        if(temp.length < input.rooms[i].quantity) return false;
    }

    return true;
}


export async function s_createBooking(input: BookingCreationInput, userId: number): Promise<number>{



    const roomsAvail = await s_areRoomsAvailable(input);
    if (!roomsAvail) return -2;
    
    const booked = await db_createBooking(input, userId);
    return booked;
}


export async function s_getAllMyBookings(userId: number): Promise<BookingDetails[]> {

  return db_getAllMyBookings(userId);
  
}

