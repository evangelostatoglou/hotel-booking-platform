import { appPool } from "../config/database";

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

export type Room = RoomType & {amenities: Amenity[]} & {images: string[]};


export async function getAllRoomTypes():Promise<RoomType[]> {
    const result = await appPool.query(
    `
    SELECT
      id,
      name,
      LOWER(REPLACE(name, ' ', '-')) AS slug,
      description,
      capacity_adults AS "capacityAdults",
      capacity_children AS "capacityChildren",
      price::numeric::text AS price,
      bed_type AS "bedType",
      size_m2 AS "sizeM2",

      (SELECT room_type_images.image_url
      FROM room_type_images
      WHERE room_type_images.room_type_id = room_types.id
      ORDER BY room_type_images.sort_order ASC, room_type_images.id ASC
      LIMIT 1) AS "imageUrl"

    FROM room_types
    ORDER BY id ASC
    `
  );

  return result.rows;
}


export async function getRoomType(slug: string):Promise<Room | null> {
    const temproom = await appPool.query(
    `
    SELECT
      id,
      name,
      LOWER(REPLACE(name, ' ', '-')) AS slug,
      description,
      capacity_adults AS "capacityAdults",
      capacity_children AS "capacityChildren",
      price::numeric::text AS price,
      bed_type AS "bedType",
      size_m2 AS "sizeM2"
    FROM room_types
    WHERE LOWER(REPLACE(name, ' ', '-')) = LOWER($1)
    `,
    [slug]
  );
  

  const room = temproom.rows[0];
  if(!room) return null;

  const amenities = await appPool.query(
    `
    SELECT
      amenities.id,
      amenities.name,
      amenities.description
    FROM amenities
    JOIN room_types_amenities
      ON room_types_amenities.amenities_id = amenities.id
    WHERE room_types_amenities.room_types_id = $1
    ORDER BY amenities.id
    `,
    [room.id]
  );

  const images = await appPool.query(
    `
    SELECT image_url AS "imageUrl"
      FROM room_type_images
      WHERE room_type_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [room.id]
  );

  room.imageUrl = images.rows[0]?.imageUrl ?? "";

  return {
    ...room,
    amenities: amenities.rows,
    imageUrls: images.rows
  };

  
}
