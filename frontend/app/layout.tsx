'use client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import {Navbar} from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Define pages where the sidebar should be hidden
  const hideSidebar = ["/", "/login", "/register"].includes(pathname);
  const hideNavbar = ["/", "/login", "/register"].includes(pathname);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1 flex">
            {!hideSidebar && !hideNavbar && <><Navbar className="w-64 hidden md:block" /><Sidebar className="w-64 hidden md:block" /></>}
            <main className="flex-1  bg-slate-50">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
