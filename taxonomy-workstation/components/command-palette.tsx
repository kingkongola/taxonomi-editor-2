'use client';

import * as React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

type SearchResult = {
  id: string;
  type: string;
  prefLabel: string;
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
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
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {/* Static suggestions or actions */}
            <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
              <span>Go to Home</span>
            </CommandItem>
          </CommandGroup>
          {results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runCommand(() => router.push(`/concept/${encodeURIComponent(item.id)}`))}
                  value={item.prefLabel + item.id} // Helper for filtering if we did local filtering, but we do remote
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{item.prefLabel}</span>
                  <span className="ml-auto text-xs text-slate-400">{item.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
