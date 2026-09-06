import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="page-content">{children}</main>
      <Footer />
    </>
  );
}
