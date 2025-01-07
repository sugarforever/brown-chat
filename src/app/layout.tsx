import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react"
import React from 'react';
import { Metadata } from 'next';

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

export const metadata: Metadata = {
  title: 'BrownChat - Realtime Voice Chatbot',
  description: 'Your Gemini 2.0 Multimodal Live API powered realtime voice chatbot.',
  keywords: ['Gemini 2.0', 'voice chat', 'AI assistant', 'multimodal AI', 'real-time chat', 'voice assistant'],
  authors: [{ name: 'VerySmallWoods' }],
  openGraph: {
    title: 'BrownChat - Gemini 2.0 Voice Chatbot',
    description: 'Your Gemini 2.0 Multimodal Live API powered realtime voice chatbot.',
    url: 'https://brownchat.io',
    siteName: 'BrownChat',
    images: [
      {
        url: '/og-image.png', // You'll need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'BrownChat Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrownChat - Gemini 2.0 Voice Chatbot',
    description: 'Your Gemini 2.0 Multimodal Live API powered realtime voice chatbot.',
    images: ['/og-image.png'], // You'll need to add this image to your public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest', // You'll need to add this file to your public folder
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="canonical" href="https://brownchat.io" />
      </head>
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
