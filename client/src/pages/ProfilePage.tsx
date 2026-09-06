import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getMyBookings } from "../api";
import type { Booking } from "../api";
import { useAuth } from "../auth";
import { PageLayout } from "../components/PageLayout";
import { formatBookingDate, formatPrice, parsePrice } from "../utils/formatters";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const requestedBookingsForUser = useRef<number | null>(null);

  useEffect(() => {
    if (!user || requestedBookingsForUser.current === user.id) return;

    requestedBookingsForUser.current = user.id;
    getMyBookings()
      .then(setBookings)
      .catch(() => setBookingsError("Your bookings could not be loaded."))
      .finally(() => setBookingsLoading(false));
  }, [user]);

  if (loading) return <PageLayout><section className="simple-page"><p>Loading profile...</p></section></PageLayout>;
  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <PageLayout>
      <section className="simple-page profile-page">
        <p className="eyebrow">GUEST AREA</p>
        <h1>My profile</h1>
        <p><strong>Name:</strong> {user.firstName ?? "Guest"} {user.lastName ?? ""}</p>
        <p><strong>Email:</strong> {user.email}</p>

        <section className="profile-bookings">
          <p className="eyebrow">RESERVATIONS</p>
          <h2>My bookings</h2>
          {bookingsLoading && <p>Loading your bookings...</p>}
          {bookingsError && <p className="page-message">{bookingsError}</p>}
          {!bookingsLoading && !bookingsError && bookings.length === 0 && <p>You do not have any bookings yet.</p>}
          {!bookingsLoading && !bookingsError && bookings.length > 0 && (
            <div className="booking-list">
              {bookings.map((booking) => {
                const bookingPrice = parsePrice(booking.price);

                return (
                  <article className="booking-card" key={booking.id}>
                    <div className="booking-card-heading">
                      <h3>Booking #{booking.id}</h3>
                      <span className={`booking-status booking-status-${booking.status}`}>{booking.status}</span>
                    </div>
                    <p><strong>Dates:</strong> {formatBookingDate(booking.checkIn)} – {formatBookingDate(booking.checkOut)}</p>
                    <p><strong>Guests:</strong> {booking.adults} adults, {booking.children} children</p>
                    <p><strong>Total:</strong> {bookingPrice === null ? "Price unavailable" : formatPrice(bookingPrice)}</p>
                    {booking.specialRequest && <p><strong>Request:</strong> {booking.specialRequest}</p>}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <Link className="book-button" to="/booking">Make a booking</Link>
      </section>
    </PageLayout>
  );
}
