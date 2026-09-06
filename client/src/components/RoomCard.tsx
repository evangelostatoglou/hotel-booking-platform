import { Link } from "react-router-dom";
import type { RoomType } from "../api";
import { formatPrice, getRoomPrice, placeholderImage } from "../utils/formatters";

export function RoomCard({ room }: { room: RoomType }) {
  const totalCapacity = (room.capacityAdults ?? 0) + (room.capacityChildren ?? 0);
  const roomPrice = getRoomPrice(room);

  return (
    <article className="room-card">
      <img src={room.imageUrl || placeholderImage} alt={room.name} />
      <div className="room-card-content">
        <p className="room-guests">Up to {totalCapacity} guests</p>
        <h3>{room.name}</h3>
        <p>{room.description ?? "A comfortable room at Hotel Tatoli."}</p>
        {roomPrice !== null && <p className="room-price">{formatPrice(roomPrice)} per night</p>}
        <Link className="text-button" to={"/rooms/" + room.slug}>
          Discover room →
        </Link>
      </div>
    </article>
  );
}
