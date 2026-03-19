'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'outline' | 'ghost';
    cor?: string;
}

export const Btn = ({ onClick, children, variant = 'outline', className, style, ...props }: BtnProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'px-4 py-1.5 text-[11px] tracking-[2px] uppercase font-mono rounded-sm transition-all duration-150 active:scale-95 whitespace-nowrap',
                variant === 'solid'
                    ? 'bg-green-600/10 text-green-600 border-none hover:bg-green-600/20'
                    : variant === 'outline'
                        ? 'bg-transparent border border-gray-200 text-gray-500 hover:border-green-600/40 hover:text-green-600'
                        : 'bg-transparent border-none text-gray-400 hover:text-green-600',
                className
            )}
            style={style}
            {...props}
        >
            {children}
        </button>
    );
};
