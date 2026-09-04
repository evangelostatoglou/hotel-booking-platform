import { appPool } from "../config/database";
import bcrypt from "bcrypt";


type RoomTypeRow = {
  id: number;
  name: string;
};

type AmenityRow = {
  id: number;
  name: string;
};

type UserRow = {
  id: number;
  email: string;
};

type RoomRow = {
  id: number;
  room_number: string;
};

type DemoUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: "A" | "G";
};

type DemoPayment = {
  amount: string;
  method: string;
  status: string;
  reference: string;
};

type DemoBooking = {
  userEmail: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: string;
  price: string;
  specialRequest: string | null;
  payment: DemoPayment | null;
};

type BasicRoomTypeImages = {
  roomTypeName: string,
  imageUrl: string,
  altText: string | null,
  sortOrder: number
};

const basicRoomTypeImages: BasicRoomTypeImages[] = [
  {
    roomTypeName: "Single",
    imageUrl: "/images/rooms/single-room.jpg",
    altText: "Single room",
    sortOrder: 0,
  },
  {
    roomTypeName: "Single",
    imageUrl: "/images/rooms/single-room-2.jpg",
    altText: "Single room view",
    sortOrder: 1,
  },
  {
    roomTypeName: "Single",
    imageUrl: "/images/rooms/single-room-3.jpg",
    altText: "Single room detail",
    sortOrder: 2,
  },
  {
    roomTypeName: "Double",
    imageUrl: "/images/rooms/double-room.jpg",
    altText: "Double room",
    sortOrder: 0,
  },
  {
    roomTypeName: "Double",
    imageUrl: "/images/rooms/double-room-2.jpg",
    altText: "Double room view",
    sortOrder: 1,
  },
  {
    roomTypeName: "Double",
    imageUrl: "/images/rooms/double-room-3.jpg",
    altText: "Double room detail",
    sortOrder: 2,
  },
  {
    roomTypeName: "Twin",
    imageUrl: "/images/rooms/twin-room.jpg",
    altText: "Twin room",
    sortOrder: 0,
  },
  {
    roomTypeName: "Twin",
    imageUrl: "/images/rooms/twin-room-2.jpg",
    altText: "Twin room view",
    sortOrder: 1,
  },
  {
    roomTypeName: "Twin",
    imageUrl: "/images/rooms/twin-room-3.jpg",
    altText: "Twin room detail",
    sortOrder: 2,
  },
  {
    roomTypeName: "Suite",
    imageUrl: "/images/rooms/suite.jpg",
    altText: "Hotel suite",
    sortOrder: 0,
  },
  {
    roomTypeName: "Suite",
    imageUrl: "/images/rooms/suite-2.jpg",
    altText: "Hotel suite view",
    sortOrder: 1,
  },
  {
    roomTypeName: "Suite",
    imageUrl: "/images/rooms/suite-3.jpg",
    altText: "Hotel suite detail",
    sortOrder: 2,
  },
];

const demoUsers: DemoUser[] = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@hotel.test",
    password: "Admin123!",
    phone: "6900000001",
    role: "A"
  },
  {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    password: "Guest123!",
    phone: "6900000002",
    role: "G"
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    email: "michael@example.com",
    password: "Guest123!",
    phone: "6900000003",
    role: "G"
  },
  {
    firstName: "Sofia",
    lastName: "Wilson",
    email: "sofia@example.com",
    password: "Guest123!",
    phone: "6900000004",
    role: "G"
  }
];

const demoBookings: DemoBooking[] = [
  {
    userEmail: "alice@example.com",
    roomNumber: "101",
    checkIn: "2026-09-05",
    checkOut: "2026-09-08",
    adults: 1,
    children: 0,
    status: "confirmed",
    price: "240.00",
    specialRequest: "Late check-in",
    payment: {
      amount: "240.00",
      method: "card",
      status: "paid",
      reference: "PAY-DEMO-001"
    }
  },
  {
    userEmail: "michael@example.com",
    roomNumber: "201",
    checkIn: "2026-09-06",
    checkOut: "2026-09-10",
    adults: 2,
    children: 0,
    status: "confirmed",
    price: "480.00",
    specialRequest: null,
    payment: {
      amount: "480.00",
      method: "card",
      status: "paid",
      reference: "PAY-DEMO-002"
    }
  },
  {
    userEmail: "sofia@example.com",
    roomNumber: "301",
    checkIn: "2026-09-07",
    checkOut: "2026-09-09",
    adults: 2,
    children: 1,
    status: "pending",
    price: "250.00",
    specialRequest: "Extra pillows",
    payment: {
      amount: "0.00",
      method: "card",
      status: "pending",
      reference: "PAY-DEMO-003"
    }
  },
  {
    userEmail: "alice@example.com",
    roomNumber: "202",
    checkIn: "2026-09-10",
    checkOut: "2026-09-13",
    adults: 2,
    children: 0,
    status: "confirmed",
    price: "360.00",
    specialRequest: null,
    payment: {
      amount: "360.00",
      method: "cash",
      status: "paid",
      reference: "PAY-DEMO-004"
    }
  },
  {
    userEmail: "michael@example.com",
    roomNumber: "401",
    checkIn: "2026-09-11",
    checkOut: "2026-09-15",
    adults: 2,
    children: 1,
    status: "confirmed",
    price: "880.00",
    specialRequest: "Baby cot required",
    payment: {
      amount: "880.00",
      method: "card",
      status: "paid",
      reference: "PAY-DEMO-005"
    }
  }
];


const roomTypes = [
  {
    name: "Single",
    description: "Comfortable room for one guest",
    adults: 1,
    children: 0,
    price: "80.00",
    bedType: "Single",
    sizeM2: 18
  },
  {
    name: "Double",
    description: "Room with one double bed",
    adults: 2,
    children: 1,
    price: "120.00",
    bedType: "Double",
    sizeM2: 25
  },
  {
    name: "Twin",
    description: "Room with two single beds",
    adults: 2,
    children: 1,
    price: "125.00",
    bedType: "Twin",
    sizeM2: 27
  },
  {
    name: "Suite",
    description: "Large room with a separate living area",
    adults: 4,
    children: 2,
    price: "220.00",
    bedType: "King",
    sizeM2: 45
  }
];

const amenities = [
  {
    name: "WiFi",
    description: "Free high-speed wireless internet"
  },
  {
    name: "TV",
    description: "Flat-screen television"
  },
  {
    name: "AC",
    description: "Air conditioning"
  },
  {
    name: "Minibar",
    description: "Small minibar with refreshments"
  },
  {
    name: "Balcony",
    description: "Private balcony"
  },
  {
    name: "Safe",
    description: "In-room safety deposit box"
  }
];

const getRoomTypeForRoom = (floor: number, roomPosition: number): string => {
  if (floor === 1 && roomPosition <= 4) {
    return "Single";
  }

  if (floor === 2 && roomPosition <= 6) {
    return "Double";
  }

  if (floor === 3 && roomPosition <= 6) {
    return "Twin";
  }

  return "Suite";
};

export async function seedBasicDb (): Promise<void> {
  const client = await appPool.connect();

  try {
    await client.query("BEGIN");

    const roomTypeIds = new Map<string, number>();

    for (const roomType of roomTypes) {
      const result = await client.query<RoomTypeRow>(
        `
          INSERT INTO room_types (
            name,
            description,
            capacity_adults,
            capacity_children,
            price,
            bed_type,
            size_m2
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5::money,
            $6,
            $7
          )
          ON CONFLICT (name)
          DO UPDATE SET
            description = EXCLUDED.description,
            capacity_adults = EXCLUDED.capacity_adults,
            capacity_children = EXCLUDED.capacity_children,
            price = EXCLUDED.price,
            bed_type = EXCLUDED.bed_type,
            size_m2 = EXCLUDED.size_m2
          RETURNING id, name;
        `,
        [
          roomType.name,
          roomType.description,
          roomType.adults,
          roomType.children,
          roomType.price,
          roomType.bedType,
          roomType.sizeM2
        ]
      );

      const row = result.rows[0];

      if (!row) {
        throw new Error(
          `Failed to create room type: ${roomType.name}`
        );
      }

      roomTypeIds.set(row.name, row.id);
    }

    const amenityIds = new Map<string, number>();

    for (const amenity of amenities) {
      const existing = await client.query<AmenityRow>(
        `
          SELECT id, name
          FROM amenities
          WHERE name = $1
          LIMIT 1;
        `,
        [amenity.name]
      );

      let amenityId: number;

      if (existing.rows[0]) {
        amenityId = existing.rows[0].id;

        await client.query(
          `
            UPDATE amenities
            SET description = $1
            WHERE id = $2;
          `,
          [amenity.description, amenityId]
        );
      } else {
        const inserted = await client.query<AmenityRow>(
          `
            INSERT INTO amenities (
              name,
              description
            )
            VALUES ($1, $2)
            RETURNING id, name;
          `,
          [amenity.name, amenity.description]
        );

        const row = inserted.rows[0];

        if (!row) {
          throw new Error(
            `Failed to create amenity: ${amenity.name}`
          );
        }

        amenityId = row.id;
      }

      amenityIds.set(amenity.name, amenityId);
    }

    const roomTypeAmenities: Record<string, string[]> = {
      Single: ["WiFi", "TV", "AC", "Safe"],
      Double: ["WiFi", "TV", "AC", "Minibar", "Safe"],
      Twin: ["WiFi", "TV", "AC", "Safe"],
      Suite: ["WiFi", "TV", "AC", "Minibar", "Balcony", "Safe"]
    };

    for (const [roomTypeName, amenityNames] of Object.entries(
      roomTypeAmenities
    )) {
      const roomTypeId = roomTypeIds.get(roomTypeName);

      if (!roomTypeId) {
        throw new Error(
          `Room type ID not found: ${roomTypeName}`
        );
      }

      for (const amenityName of amenityNames) {
        const amenityId = amenityIds.get(amenityName);

        if (!amenityId) {
          throw new Error(
            `Amenity ID not found: ${amenityName}`
          );
        }

        await client.query(
          `
            INSERT INTO room_types_amenities (
              room_types_id,
              amenities_id
            )
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
          `,
          [roomTypeId, amenityId]
        );
      }
    }

    for (let floor = 1; floor <= 4; floor += 1) {
      for (
        let roomPosition = 1;
        roomPosition <= 12;
        roomPosition += 1
      ) {
        const roomNumber = `${floor}${String(
          roomPosition
        ).padStart(2, "0")}`;

        const roomTypeName = getRoomTypeForRoom(
          floor,
          roomPosition
        );

        const roomTypeId = roomTypeIds.get(roomTypeName);

        if (!roomTypeId) {
          throw new Error(
            `Room type ID not found: ${roomTypeName}`
          );
        }

        await client.query(
          `
            INSERT INTO rooms (
              room_type_id,
              room_number,
              status
            )
            VALUES ($1, $2, 'available')
            ON CONFLICT (room_number)
            DO UPDATE SET
              room_type_id = EXCLUDED.room_type_id,
              status = EXCLUDED.status;
          `,
          [roomTypeId, roomNumber]
        );
      }
    }


    for (const image of basicRoomTypeImages) {
      const roomTypeId = roomTypeIds.get(
        image.roomTypeName
      );

      if (!roomTypeId) {
        throw new Error(
          `Room type ID not found: ${image.roomTypeName}`
        );
      }

      await client.query(
        `
          INSERT INTO room_type_images (
            room_type_id,
            image_url,
            alt_text,
            sort_order
          )
          SELECT $1, $2, $3, $4
          WHERE NOT EXISTS (
            SELECT 1
            FROM room_type_images
            WHERE room_type_id = $1
              AND image_url = $2
          );
        `,
        [
          roomTypeId,
          image.imageUrl,
          image.altText,
          image.sortOrder
        ]
      );
    }




    await client.query("COMMIT");

    console.log(
      "Room types, rooms, amenities, and relationships seeded"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export async function seedDemoDb (): Promise<void> {
    const client = await appPool.connect();

  try {
    await client.query("BEGIN");

    const userIds = new Map<string, number>();

    for (const user of demoUsers) {
      const passwordHash = await bcrypt.hash(user.password, 12);

      const result = await client.query<UserRow>(
        `
          INSERT INTO users (
            first_name,
            last_name,
            email,
            password_hash,
            phone,
            created_at,
            role
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), $6)
          ON CONFLICT (email)
          DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            password_hash = EXCLUDED.password_hash,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role
          RETURNING id, email;
        `,
        [
          user.firstName,
          user.lastName,
          user.email,
          passwordHash,
          user.phone,
          user.role
        ]
      );

      const insertedUser = result.rows[0];

      if (!insertedUser) {
        throw new Error(
          `Failed to insert user: ${user.email}`
        );
      }

      userIds.set(insertedUser.email, insertedUser.id);
    }

    for (const booking of demoBookings) {
      const userId = userIds.get(booking.userEmail);

      if (!userId) {
        throw new Error(
          `User not found: ${booking.userEmail}`
        );
      }

      const roomResult = await client.query<RoomRow>(
        `
          SELECT id, room_number
          FROM rooms
          WHERE room_number = $1;
        `,
        [booking.roomNumber]
      );

      const room = roomResult.rows[0];

      if (!room) {
        throw new Error(
          `Room not found: ${booking.roomNumber}`
        );
      }

      const bookingResult = await client.query<{ id: number }>(
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
            $6,
            $7::money,
            NOW(),
            $8
          )
          RETURNING id;
        `,
        [
          userId,
          booking.checkIn,
          booking.checkOut,
          booking.adults,
          booking.children,
          booking.status,
          booking.price,
          booking.specialRequest
        ]
      );

      const insertedBooking = bookingResult.rows[0];

      if (!insertedBooking) {
        throw new Error(
          "Failed to insert demo booking"
        );
      }

      await client.query(
        `
          INSERT INTO bookings_rooms (
            bookings_id,
            rooms_id
          )
          VALUES ($1, $2);
        `,
        [insertedBooking.id, room.id]
      );

      if (booking.payment) {
        await client.query(
          `
            INSERT INTO payments (
              booking_id,
              amount,
              method,
              status,
              reference,
              created_at
            )
            VALUES (
              $1,
              $2::money,
              $3,
              $4,
              $5,
              NOW()
            );
          `,
          [
            insertedBooking.id,
            booking.payment.amount,
            booking.payment.method,
            booking.payment.status,
            booking.payment.reference
          ]
        );
      }
    }

    await client.query("COMMIT");

    console.log(
      "Demo users, bookings, room relationships, and payments seeded"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

