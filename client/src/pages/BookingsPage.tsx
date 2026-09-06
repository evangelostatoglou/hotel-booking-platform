import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";

export function BookingsPage() {
  return (
    <PageLayout>
      <section className="simple-page">
        <p className="eyebrow">GUEST AREA</p>
        <h1>My bookings</h1>
        <p>Your bookings are available on your profile page.</p>
        <Link className="book-button" to="/profile">View my bookings</Link>
      </section>
    </PageLayout>
  );
}
