'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/command';
import { Home, Network, Layers, Settings, Database } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/graph', icon: Network, label: 'Graph' },
  { href: '/workspace', icon: Layers, label: 'Workspace' },
  { href: '/data', icon: Database, label: 'Data' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-20 flex flex-col items-center py-6 bg-[var(--deco-bg)] border-r border-[var(--deco-gold-dim)] h-screen shadow-[4px_0_24px_rgba(0,0,0,0.5)] relative z-50">
      {/* Art Deco Logo */}
      <div className="mb-10 relative group">
        <div className="absolute inset-0 bg-[var(--deco-gold)] blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="h-12 w-12 border-2 border-[var(--deco-gold)] rotate-45 flex items-center justify-center bg-black relative z-10 transition-transform group-hover:scale-110 duration-300">
          <div className="h-10 w-10 border border-[var(--deco-gold-dim)] flex items-center justify-center">
            <span className="font-cinzel font-bold text-[var(--deco-gold)] text-xl -rotate-45">T</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-6 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative group flex items-center justify-center p-3 transition-all duration-300",
                isActive ? "text-[var(--deco-gold)]" : "text-slate-500 hover:text-[var(--deco-text)]"
              )}
              title={item.label}
            >
              {/* Active/Hover Indicator */}
              <div className={cn(
                "absolute inset-0 border border-[var(--deco-gold)] opacity-0 transition-all duration-300 rotate-45 scale-50",
                isActive ? "opacity-100 scale-100 bg-[var(--deco-gold)]/10" : "group-hover:opacity-50 group-hover:scale-75"
              )} />

              <item.icon size={20} className="relative z-10" />
            </Link>
          );
        })}
      </nav>

      {/* Decorative bottom element */}
      <div className="mt-auto mb-6 flex flex-col gap-1 items-center opacity-30">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-[var(--deco-gold)] to-transparent"></div>
        <div className="w-2 h-2 rotate-45 border border-[var(--deco-gold)]"></div>
      </div>
    </div>
  );
}
