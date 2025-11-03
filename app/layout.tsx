import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramen Menu Vision",
  description: "Upload a menu image and generate AI-powered dish previews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

