import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';
import { Providers } from "./providers";

// Dynamically import client components
const Navbar = dynamic(() => import('@/components/Navbar'), { 
  ssr: true,
  loading: () => <div className="h-16 border-b"></div>
});

const Footer = dynamic(() => import('@/components/Footer'), { 
  ssr: true,
  loading: () => <div className="border-t py-10"></div>
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BankLoan - Modern Banking Solutions",
  description: "Providing reliable loan services for all your financial needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
