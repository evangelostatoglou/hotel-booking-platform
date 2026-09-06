import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../api";
import type { RoomType } from "../api";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { RoomCard } from "../components/RoomCard";

export function HomePage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch(() => setError("Room information is not available yet."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <Header />
      <main id="top">
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">ATHENS, GREECE</p>
            <h1>Your elegant stay in the heart of Athens</h1>
            <p>Thoughtful hospitality, modern comfort, and the timeless energy of Greece.</p>
            <Link className="book-button" to="/booking">Check Availability</Link>
          </div>
        </section>

        <section className="intro section">
          <p className="eyebrow">WELCOME TO HOTEL TATOLI</p>
          <h2>A calm and comfortable base for discovering Athens.</h2>
          <p>From slow mornings to late evenings in the city, Hotel Tatoli is designed to make every stay feel effortless.</p>
        </section>

        <section className="section rooms-section" id="rooms">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ACCOMMODATION</p>
              <h2>Find your room</h2>
            </div>
            <Link to="/rooms">View all rooms →</Link>
          </div>
          {loading && <p>Loading rooms...</p>}
          {error && <p className="page-message">{error}</p>}
          {!loading && !error && <div className="room-grid">{rooms.map((room) => <RoomCard room={room} key={room.id} />)}</div>}
        </section>

        <section className="feature-section" id="experience">
          <div>
            <p className="eyebrow">THE TATOLI EXPERIENCE</p>
            <h2>Made for slow mornings and memorable evenings.</h2>
          </div>
          <p>Enjoy a welcoming atmosphere, thoughtful service, and an ideal location for your Athens escape.</p>
        </section>

        <section className="location section" id="contact">
          <p className="eyebrow">OUR LOCATION</p>
          <h2>Meet us in Athens</h2>
          <p>Hotel Tatoli · Athens, Greece</p>
          <a className="book-button" href="mailto:hello@hoteltatoli.com">Contact Us</a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
