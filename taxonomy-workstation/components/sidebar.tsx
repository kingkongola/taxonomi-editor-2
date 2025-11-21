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
    <div className="w-16 flex flex-col items-center py-4 bg-slate-900 border-r border-slate-800 h-screen">
      <div className="mb-8">
         <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">T</div>
      </div>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "p-3 rounded-xl transition-colors hover:bg-slate-800 text-slate-400 hover:text-slate-100",
              pathname === item.href && "bg-slate-800 text-blue-400"
            )}
            title={item.label}
          >
            <item.icon size={20} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
