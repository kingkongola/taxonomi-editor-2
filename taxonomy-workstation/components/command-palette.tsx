'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { Home, Network, Settings, Moon, Search } from 'lucide-react';

type SearchResult = {
  id: string;
  type: string;
  prefLabel: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="bg-[var(--deco-bg)] border-2 border-[var(--deco-gold)] shadow-[0_0_50px_rgba(212,175,55,0.2)] relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--deco-gold)] z-10"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--deco-gold)] z-10"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--deco-gold)] z-10"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--deco-gold)] z-10"></div>

        <div className="relative z-10">
          <CommandInput
            placeholder="Type a command or search..."
            value={query}
            onValueChange={setQuery}
            className="font-josefin text-[var(--deco-text)] placeholder:text-[var(--deco-gold-dim)] border-b border-[var(--deco-gold)]/30"
          />
          <CommandList className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[var(--deco-gold)] scrollbar-track-transparent">
            <CommandEmpty className="py-6 text-center text-[var(--deco-gold-dim)] font-cinzel">No results found.</CommandEmpty>

            <CommandGroup heading="Suggestions" className="text-[var(--deco-gold)] font-cinzel uppercase tracking-widest text-xs mb-2">
              <CommandItem onSelect={() => runCommand(() => router.push('/'))} className="aria-selected:bg-[var(--deco-gold)]/20 aria-selected:text-[var(--deco-gold)] text-[var(--deco-text)] font-josefin">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/graph'))} className="aria-selected:bg-[var(--deco-gold)]/20 aria-selected:text-[var(--deco-gold)] text-[var(--deco-text)] font-josefin">
                <Network className="mr-2 h-4 w-4" />
                <span>Graph View</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/settings'))} className="aria-selected:bg-[var(--deco-gold)]/20 aria-selected:text-[var(--deco-gold)] text-[var(--deco-text)] font-josefin">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="bg-[var(--deco-gold)]/20 my-2" />

            <CommandGroup heading="Theme" className="text-[var(--deco-gold)] font-cinzel uppercase tracking-widest text-xs mb-2">
              <CommandItem className="aria-selected:bg-[var(--deco-gold)]/20 aria-selected:text-[var(--deco-gold)] text-[var(--deco-text)] font-josefin">
                <Moon className="mr-2 h-4 w-4" />
                <span>Toggle Dark Mode</span>
              </CommandItem>
            </CommandGroup>

            {results.length > 0 && (
              <CommandGroup heading="Search Results" className="text-[var(--deco-gold)] font-cinzel uppercase tracking-widest text-xs mb-2">
                {results.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => runCommand(() => router.push(`/concept/${encodeURIComponent(item.id)}`))}
                    value={item.prefLabel + item.id} // Helper for filtering if we did local filtering, but we do remote
                    className="aria-selected:bg-[var(--deco-gold)]/20 aria-selected:text-[var(--deco-gold)] text-[var(--deco-text)] font-josefin"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>{item.prefLabel}</span>
                    <span className="ml-auto text-xs text-[var(--deco-gold-dim)]">{item.type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </div>
      </div>
    </CommandDialog>
  );
}
