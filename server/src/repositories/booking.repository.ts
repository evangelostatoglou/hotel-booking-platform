import { appPool } from "../config/database";
import { calculateNights } from "../services/booking.service";
import { BookingAvailabilityInput, BookingCreationInput } from "../validators/bookings.schemas";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type AvailabilityDBcheck = {
    roomTypeId: number,
    checkIn: string,
    checkOut: string
};

type RoomTypeData = {
  capacityAdults: number | null;
  capacityChildren: number | null;
  price: string | null;
};

export type BookingDetails = {
    id: number,
    checkIn: string,
    checkOut: string,
    adults: number,
    children: number,
    status: BookingStatus,
    price: number,
    createdAt: string,
    specialRequest: string,
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function db_areRoomsAvailable(roomTypeId: number, checkIn: string, checkOut: string):Promise<number[]> {
    const result = await appPool.query(
    `
    WITH nogoodrooms AS(
        SELECT r.id
        FROM rooms r
        JOIN bookings_rooms br
            ON r.id = br.rooms_id
        JOIN bookings b
            ON br.bookings_id = b.id
        WHERE r.room_type_id = $1
            AND b.check_in < $3::date AND b.check_out > $2::date
        )
    SELECT r.id
    FROM rooms r
    WHERE r.room_type_id = $1 AND NOT EXISTS (SELECT 1 FROM nogoodrooms WHERE nogoodrooms.id = r.id)
    `, [roomTypeId, checkIn, checkOut]
  );

  return result.rows.map(row => row.id);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export async function db_createBooking(input: BookingCreationInput, userId: number):Promise<number> {
    
    let new_booking_id = -1;
    const client = await appPool.connect();
    const nights = calculateNights(input.checkIn, input.checkOut);

    try{
        await client.query("BEGIN");
/////////////////////////////
        const selectedRoomIds: number[] = [];

        let totalAdultCapacity = 0;
        let totalChildrenCapacity = 0;
        let totalPrice = 0;

        for (const requestedRoom of input.rooms) {
            const roomTypeResult = await client.query(
                `
                SELECT
                    capacity_adults AS "capacityAdults",
                    capacity_children AS "capacityChildren",
                    price::numeric(5,2) AS price
                FROM room_types
                WHERE id = $1
                `,
                [requestedRoom.roomTypeId]
                );

            const roomType = roomTypeResult.rows[0];

            if (
                !roomType ||
                roomType.capacityAdults === null ||
                roomType.capacityChildren === null ||
                roomType.price === null
            ) {
                await client.query("ROLLBACK");
                return -1; // wrong input
            }

            totalAdultCapacity += roomType.capacityAdults * requestedRoom.quantity;

            totalChildrenCapacity += roomType.capacityChildren * requestedRoom.quantity;

            totalPrice += Number(roomType.price) * requestedRoom.quantity * nights;

            const availableRoomsResult = await client.query(
                `
                WITH nogoodrooms AS(
                    SELECT r.id
                    FROM rooms r
                    JOIN bookings_rooms br
                        ON r.id = br.rooms_id
                    JOIN bookings b
                        ON br.bookings_id = b.id
                    WHERE r.room_type_id = $1
                        AND b.check_in < $3::date AND b.check_out > $2::date
                    )
                SELECT r.id
                FROM rooms r
                WHERE r.room_type_id = $1 AND NOT EXISTS (SELECT 1 FROM nogoodrooms WHERE nogoodrooms.id = r.id)
                ORDER BY r.id
                LIMIT $4
                FOR UPDATE OF r SKIP LOCKED
                `
                , [requestedRoom.roomTypeId, input.checkIn, input.checkOut, requestedRoom.quantity]
            );

            if (availableRoomsResult.rows.length < requestedRoom.quantity) {
                await client.query("ROLLBACK");
                return -2; //not enough rooms available fot this request
            }

            selectedRoomIds.push(...availableRoomsResult.rows.map(room => room.id));
        }

        if (input.adults > totalAdultCapacity || input.children > totalChildrenCapacity) {
            await client.query("ROLLBACK");
            return -3; //too many adults or children for the chosen rooms
        }

        const bookingResult = await client.query<{id: number}>(
            `
                INSERT INTO bookings (
                    user_id,
                    check_in,
                    check_out,
                    adults,
                    children,
                    status,
                    price,
                    created_at,
                    special_request
                )
                VALUES (
                    $1,
                    $2::date,
                    $3::date,
                    $4,
                    $5,
                    'confirmed',
                    $6::money,
                    NOW(),
                    $7
                )
                RETURNING id
            `,
            [
                userId,
                input.checkIn,
                input.checkOut,
                input.adults,
                input.children,
                totalPrice.toFixed(2),
                input.specialRequest
            ]
        );

        const booking = bookingResult.rows[0];

        if (!booking) {
            await client.query("ROLLBACK");
            return -4; //something went wrong in the db
        }

        for (const roomId of selectedRoomIds) {
            await client.query(
                `
                    INSERT INTO bookings_rooms (
                    bookings_id,
                    rooms_id
                    )
                    VALUES ($1, $2)
                `,
                [
                booking.id,
                roomId
                ]
            );
        }
/////////////////////////////////////////////////////
        await client.query("COMMIT");
        new_booking_id = booking.id;
    }
    catch (err){
        await client.query("ROLLBACK");
        throw err;
    }
    finally{
        client.release();
    }

    return new_booking_id;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export async function db_getAllMyBookings(userId: number): Promise<BookingDetails[]> {
    
    const result = await appPool.query(
        `
            SELECT 
                id,
                check_in AS "checkIn",
                check_out AS "checkOut",
                adults,
                children,
                status,
                price,
                created_at AS "createdAt",
                special_request AS "specialRequest"
            FROM bookings
            WHERE bookings.user_id = $1
        `
    , [userId]);

    return result.rows;
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




