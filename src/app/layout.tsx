import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react"
import React from 'react';
import BrownChatLogo from "@/components/icons/BrownChatLogo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-gray-950`}
        >
          <main className="flex flex-col items-center justify-center min-h-screen p-4">
            {children}
          </main>
          <Analytics />
        </body>
      </AuthProvider>
    </html>
  );
}
