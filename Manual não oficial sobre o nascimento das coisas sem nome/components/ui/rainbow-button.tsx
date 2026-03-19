'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export const RainbowButton = ({ children, className, ...props }: RainbowButtonProps) => {
    return (
        <button
            className={cn(
                'rainbow-btn relative inline-flex items-center justify-center px-4 py-1.5 text-[12px] font-semibold tracking-wide text-white transition-all rounded-lg overflow-hidden active:scale-95',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
