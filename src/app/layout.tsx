import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Namma Bengaluru — Community Explorer",
  description:
    "Discover, vote, and share tips about the best places in Bangalore. Community-powered, login-free.",
  keywords: ["bangalore", "bengaluru", "places", "travel", "community", "tips"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
