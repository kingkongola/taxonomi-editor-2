import { CommandPalette } from '@/components/command-palette';
import { Sidebar } from '@/components/sidebar';
import "./globals.css";
import type { Metadata } from "next";
import { Cinzel, Josefin_Sans } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], variable: '--font-cinzel' });
const josefin = Josefin_Sans({ subsets: ["latin"], variable: '--font-josefin' });

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
      <body className={`${josefin.className} ${cinzel.variable} bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <div className="flex flex-1 relative">
          <Sidebar />
          <main className="flex-1 relative min-h-0">
            {children}
          </main>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
