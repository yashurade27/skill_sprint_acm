import type { Metadata } from "next";
import { Geist, Geist_Mono, Prata } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const prata = Prata({
  weight: "400",
  variable: "--font-prata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KadamKate's Snacks - Authentic Indian Delights",
  description: "Discover authentic Indian sweets, snacks, and traditional delicacies from KadamKate's Snacks",
  icons: {
    icon: [
      {
        url: "/restaurant.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/restaurant.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: "/restaurant.png",
    apple: "/restaurant.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/restaurant.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/restaurant.png" />
        <link rel="shortcut icon" href="/restaurant.png" />
        <link rel="apple-touch-icon" href="/restaurant.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${prata.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
