import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistSans = manrope;

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vitrine",
  description: "Collection game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={'${geistSans.variable} ${geistMono.variable} antialiased'}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            minHeight: "100vh",
            background: "#ffffff",
            position: "relative",
            zIndex: 1,
          }}
        >
          <SideNav />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
            }}
          >
            <Navbar />
            <div style={{ flex: 1, minWidth: 0, padding: "18px 24px 32px", position: "relative" }}>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
