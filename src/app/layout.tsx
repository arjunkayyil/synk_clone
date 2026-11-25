/**
 * src/app/layout.tsx
 * Root layout: sets dark background, includes TopBar, Sidebar, main area, RightPanel.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Providers } from "@/app/providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synk – Task Management",
  description: "A fast, keyboard-driven task management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full flex flex-col" style={{ backgroundColor: "var(--bg-base)" }}>
        <Providers>
          {/* Top bar spans full width */}
          <TopBar />

          {/* Below the top bar: sidebar + main + right panel */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />

            {/* Main content scrolls independently */}
            <main
              className="flex-1 overflow-y-auto p-6"
              style={{ backgroundColor: "var(--bg-base)" }}
            >
              {children}
            </main>

            <RightPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}
