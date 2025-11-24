import React from 'react';

interface DecoCornerProps {
    className?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function DecoCorner({ className = '', position }: DecoCornerProps) {
    const rotation = {
        'top-left': 'rotate(0)',
        'top-right': 'rotate(90)',
        'bottom-right': 'rotate(180)',
        'bottom-left': 'rotate(270)',
    };

    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`absolute pointer-events-none ${className}`}
            style={{
                transform: rotation[position],
                top: position.includes('top') ? 0 : undefined,
                bottom: position.includes('bottom') ? 0 : undefined,
                left: position.includes('left') ? 0 : undefined,
                right: position.includes('right') ? 0 : undefined,
            }}
        >
            <path
                d="M2 2H40V4H4V40H2V2Z"
                fill="var(--deco-gold)"
            />
            <path
                d="M8 8H30V9H9V30H8V8Z"
                fill="var(--deco-gold-dim)"
            />
            <rect x="14" y="14" width="4" height="4" fill="var(--deco-gold)" />
            <rect x="20" y="14" width="2" height="2" fill="var(--deco-gold-dim)" />
            <rect x="14" y="20" width="2" height="2" fill="var(--deco-gold-dim)" />
        </svg>
    );
}

export function DecoFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative p-6 border border-slate-800/50 ${className}`}>
            <DecoCorner position="top-left" />
            <DecoCorner position="top-right" />
            <DecoCorner position="bottom-right" />
            <DecoCorner position="bottom-left" />
            {children}
        </div>
    );
}
