import { useEffect, useState } from "react";
import { getRooms } from "../api";
import type { RoomType } from "../api";
import { PageLayout } from "../components/PageLayout";
import { RoomCard } from "../components/RoomCard";

export function RoomsPage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch(() => setError("The room list is not available yet. Please start the server."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <section className="simple-page">
        <p className="eyebrow">ACCOMMODATION</p>
        <h1>Our rooms</h1>
        {loading && <p>Loading rooms...</p>}
        {error && <p className="page-message">{error}</p>}
        {!loading && !error && <div className="room-grid">{rooms.map((room) => <RoomCard room={room} key={room.id} />)}</div>}
      </section>
    </PageLayout>
  );
}
