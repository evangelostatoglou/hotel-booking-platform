import { BookingDetails, areRoomsAvailable as getAvailableRoomIds, createBooking as createBookingRecord, getAllMyBookings as getBookingRecords } from "../repositories/booking.repository";
import { BookingAvailabilityInput, BookingCreationInput } from "../validators/bookings.schemas";



export async function areRoomsAvailable(input: BookingAvailabilityInput, return_array?: boolean): Promise<boolean | number[]>{
    
    let temp;
    for(let i=0 ; i<input.rooms.length ; i++){
        temp = await getAvailableRoomIds(input.rooms[i].roomTypeId, input.checkIn, input.checkOut);
        if (return_array) return temp;
        if(temp.length < input.rooms[i].quantity) return false;
    }

    return true;
}


export async function createBooking(input: BookingCreationInput, userId: number): Promise<number>{
    return createBookingRecord(input, userId);
}


export async function getAllMyBookings(userId: number): Promise<BookingDetails[]> {

  return getBookingRecords(userId);
  
}

