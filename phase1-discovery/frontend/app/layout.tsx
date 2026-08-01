import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phase 1 — AI Discovery Engine",
  description: "Swiggy Instamart new category discovery dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
