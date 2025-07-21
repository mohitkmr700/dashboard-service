import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/toaster";
import { AppProviders } from "./providers";
import { GlobalLoadingOverlay } from "../components/global-loading-overlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Management Dashboard",
  description: "A modern task management dashboard built with Next.js",
};

// Mock user for demonstration
// const currentUser = { role: "admin" as const };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppProviders>
          {children}
          <GlobalLoadingOverlay />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
} 