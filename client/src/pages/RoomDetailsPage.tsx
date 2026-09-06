import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRoom } from "../api";
import type { RoomDetails } from "../api";
import { PageLayout } from "../components/PageLayout";
import { formatPrice, getRoomPrice, placeholderImage } from "../utils/formatters";

export function RoomDetailsPage() {
  const { slug } = useParams();
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (slug) {
      getRoom(slug)
        .then(setRoom)
        .catch(() => setError("This room could not be found."));
    }
  }, [slug]);

  if (error) {
    return <PageLayout><section className="simple-page"><h1>{error}</h1><Link className="book-button" to="/rooms">Back to rooms</Link></section></PageLayout>;
  }

  if (!room) {
    return <PageLayout><section className="simple-page"><p>Loading room...</p></section></PageLayout>;
  }

  const totalCapacity = (room.capacityAdults ?? 0) + (room.capacityChildren ?? 0);
  const roomImages = room.imageUrls.length > 0
    ? room.imageUrls.map((image) => image.imageUrl)
    : [room.imageUrl || placeholderImage];
  const roomPrice = getRoomPrice(room);

  return (
    <PageLayout>
      <section className="room-detail simple-page">
        <div className="room-gallery">
          <img src={roomImages[currentImage]} alt={room.name + " view " + (currentImage + 1)} />
          <button className="gallery-arrow gallery-arrow-left" type="button" onClick={() => setCurrentImage((currentImage - 1 + roomImages.length) % roomImages.length)} aria-label="Previous room image">‹</button>
          <button className="gallery-arrow gallery-arrow-right" type="button" onClick={() => setCurrentImage((currentImage + 1) % roomImages.length)} aria-label="Next room image">›</button>
          <span className="gallery-counter">{currentImage + 1} / {roomImages.length}</span>
        </div>
        <div>
          <p className="eyebrow">ROOM DETAILS</p>
          <h1>{room.name}</h1>
          <p>{room.description}</p>
          <p>Up to {totalCapacity} guests · {room.sizeM2 ? room.sizeM2 + " m² · " : ""}{room.bedType ?? "Comfortable bedding"}</p>
          <p className="room-price">{roomPrice !== null ? formatPrice(roomPrice) + " per night" : "Price unavailable"}</p>
          <Link className="book-button" to={"/booking?roomType=" + room.slug}>Book this room</Link>
        </div>
      </section>

      <section className="amenities-section simple-page">
        <p className="eyebrow">ROOM AMENITIES</p>
        <h2>Everything you need</h2>
        <div className="amenities-grid">
          {room.amenities.map((amenity) => (
            <article className="amenity-item" key={amenity.id}>
              <h3>{amenity.name ?? "Amenity"}</h3>
              {amenity.description && <p>{amenity.description}</p>}
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
