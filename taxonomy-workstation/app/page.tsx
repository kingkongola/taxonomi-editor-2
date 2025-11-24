import { Zap, Columns, Edit3, Command } from 'lucide-react';
import { DecoBackground } from '@/components/ui/deco-background';
import { DecoFrame } from '@/components/ui/deco-frame';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-8 md:p-12 bg-[var(--deco-bg)]">
      <DecoBackground />

      <div className="relative z-10 max-w-5xl w-full">
        {/* Main Title Section */}
        <div className="text-center mb-8 md:mb-12 relative">
          {/* Decorative lines */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-px h-24 bg-gradient-to-b from-transparent via-[var(--deco-gold)] to-transparent"></div>

          <h1 className="text-5xl md:text-8xl font-bold mb-4 md:mb-6 font-cinzel tracking-widest leading-tight">
            <span className="deco-gradient-text drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              TAXONOMY
            </span>
            <br />
            <span className="text-2xl md:text-5xl text-[var(--deco-gold-dim)] font-light tracking-[0.5em] border-t border-b border-[var(--deco-gold)]/30 py-3 md:py-4 mt-2 md:mt-4 inline-block">
              WORKSTATION
            </span>
          </h1>

          <p className="text-[var(--deco-text)]/80 max-w-lg mx-auto font-josefin text-base md:text-lg tracking-wide mb-8">
            The premier environment for sophisticated taxonomy management and visualization.
          </p>

          <div className="inline-flex items-center gap-3 px-6 py-3 border border-[var(--deco-gold)] bg-black/50 backdrop-blur-sm rounded-sm group cursor-default hover:bg-[var(--deco-gold)]/10 transition-colors">
            <span className="text-[var(--deco-gold-dim)] font-cinzel text-sm tracking-widest uppercase">Press</span>
            <kbd className="bg-[var(--deco-gold)] text-black px-2 py-1 rounded-sm text-sm font-bold font-mono shadow-[0_0_10px_rgba(212,175,55,0.5)]">⌘K</kbd>
            <span className="text-[var(--deco-gold-dim)] font-cinzel text-sm tracking-widest uppercase">to Initialize</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Indexed RDF data with instant search capabilities."
            },
            {
              icon: Columns,
              title: "Split Views",
              desc: "Compare concepts side-by-side with robust layout controls."
            },
            {
              icon: Edit3,
              title: "Inline Editing",
              desc: "Edit labels and relations without leaving your keyboard."
            }
          ].map((feature, i) => (
            <DecoFrame key={i} className="bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors group">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 border border-[var(--deco-gold)] rotate-45 group-hover:rotate-0 transition-transform duration-500 bg-black">
                  <feature.icon className="w-6 h-6 text-[var(--deco-gold)] -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--deco-gold)] font-cinzel uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--deco-text)]/70 font-josefin leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </DecoFrame>
          ))}
        </div>
      </div>
    </div>
  );
}
