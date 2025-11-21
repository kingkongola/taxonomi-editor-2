import { CommandPalette } from '@/components/command-palette';
import { Sidebar } from '@/components/sidebar';
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taxonomy Workstation",
  description: "The Taxonomy Workstation for power users",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 h-screen flex overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden relative">
          {children}
        </main>
        <CommandPalette />
      </body>
    </html>
  );
}
