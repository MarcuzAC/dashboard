"use client";
import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/SideBar";
import AppBar from "./components/AppBar";
import "./globals.css";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [isSidebarOpen]);

  const isLoginPage = (pathname === "/login" || pathname === "/register");

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gray-50 flex">
          {!isLoginPage && (
            <>
              {/* Sidebar (Fixed on Desktop, Drawer on Mobile) */}
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            </>
          )}

          {/* Main Content */}
          <div className={`flex-1 ${!isLoginPage ? "lg:pl-64" : "lg:pl-0"} flex flex-col`}>
            {!isLoginPage && <AppBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
            
            <main className={`flex-1 ${!isLoginPage ? "pt-16" : ""}`}>{children}</main>
            
           {!isLoginPage && (
              <footer className="bg-gray-800 text-white p-4 text-center w-full" style={{width:"100%"}}>
                <p>© 2025 Milton. All rights reserved.</p>
              </footer>
            )}
          </div>
        </div> 
      </body>
    </html>
  );
}
