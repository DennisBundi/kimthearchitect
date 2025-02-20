import type { Metadata } from "next";
import "./globals.css";
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: "KimthArchitect",
  description: "Professional Architectural Services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
