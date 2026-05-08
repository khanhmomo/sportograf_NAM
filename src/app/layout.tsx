import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import ToastContainer from "@/components/ToastContainer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sportograf North America - Event Management",
  description: "Choose events and submit travel information for Sportograf North America events. Manage registrations, travel forms, and event logistics in one platform.",
  keywords: "Sportograf, North America, events, travel, registration, sports management",
  authors: [{ name: "Sportograf North America" }],
  creator: "Sportograf North America",
  publisher: "Sportograf North America",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sportograf-nam.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sportograf North America - Event Management",
    description: "Choose events and submit travel information for Sportograf North America events. Manage registrations, travel forms, and event logistics in one platform.",
    url: 'https://sportograf-nam.vercel.app',
    siteName: "Sportograf North America",
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Sportograf North America Event Management',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sportograf North America - Event Management",
    description: "Choose events and submit travel information for Sportograf North America events",
    images: ['/og-image.svg'],
    creator: '@sportograf',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
