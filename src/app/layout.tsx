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
  title: "Sportograf Digital Forms",
  description: "Choose events and submit travel information for Sportograf events. Manage registrations, travel forms, and event logistics in one platform.",
  keywords: "Sportograf, events, travel, registration, sports management",
  authors: [{ name: "Sportograf" }],
  creator: "Sportograf",
  publisher: "Sportograf",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sgforms.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sportograf Digital Forms",
    description: "Choose events and submit travel information for Sportograf events. Manage registrations, travel forms, and event logistics in one platform.",
    url: 'https://sgforms.vercel.app',
    siteName: "Sportograf Digital Forms",
    images: [
      {
        url: 'https://www.sportograf.com/images/sg-logo-new-no-text.png',
        width: 400,
        height: 400,
        alt: 'Sportograf Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sportograf Digital Forms",
    description: "Choose events and submit travel information for Sportograf events",
    images: ['https://www.sportograf.com/images/sg-logo-new-no-text.png'],
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
