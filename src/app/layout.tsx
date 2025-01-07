import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/react"
import React from 'react';
import { MessageSquare, Settings } from 'lucide-react';

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
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen`}
        >
          {/* Left Navigation Panel */}
          <nav className="w-64 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col">
            {/* Brand */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-xl font-bold">BrownChat</h1>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col p-4 space-y-2">
              <a
                href="/"
                className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                Realtime Chat
              </a>
              <a
                href="/settings"
                className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </a>
            </div>
          </nav>

          {/* Right Content Panel */}
          <main className="flex-1 h-full overflow-y-auto">
            <div className="h-full flex items-start justify-center p-8">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </div>
          </main>
          <Analytics />
        </body>
      </AuthProvider>
    </html>
  );
}
