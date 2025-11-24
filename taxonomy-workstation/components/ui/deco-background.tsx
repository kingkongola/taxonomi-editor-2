import React from 'react';

export function DecoBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <svg
                className="absolute w-full h-full opacity-20"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--deco-gold)" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="var(--deco-gold)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--deco-gold)" stopOpacity="0.1" />
                    </linearGradient>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--deco-gold)" strokeWidth="0.1" opacity="0.2" />
                    </pattern>
                </defs>

                {/* Background Grid */}
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Sunburst Rays */}
                <g transform="translate(50, 100)">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <path
                            key={i}
                            d="M0,0 L-10,-100 L10,-100 Z"
                            fill="url(#gold-gradient)"
                            transform={`rotate(${(i * 15) - 82.5})`}
                            className="animate-pulse"
                            style={{ animationDuration: `${3 + i * 0.5} s` }}
                        />
                    ))}
                </g>

                {/* Geometric Corners */}
                <path d="M0,0 L20,0 L0,20 Z" fill="var(--deco-gold)" opacity="0.1" />
                <path d="M100,0 L80,0 L100,20 Z" fill="var(--deco-gold)" opacity="0.1" />
            </svg>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--deco-bg)_90%)]"></div>
        </div>
    );
}
