import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";

export function NotFoundPage() {
  return (
    <PageLayout>
      <section className="simple-page">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="book-button" to="/">Return home</Link>
      </section>
    </PageLayout>
  );
}
