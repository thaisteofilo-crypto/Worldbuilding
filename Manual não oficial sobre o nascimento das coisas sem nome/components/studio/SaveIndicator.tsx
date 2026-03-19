'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
    salvo: boolean;
}

export const SaveIndicator = ({ salvo }: SaveIndicatorProps) => {
    return (
        <span
            className={cn(
                'text-[10px] tracking-[1px] font-mono transition-colors duration-500 flex items-center gap-2',
                salvo ? 'text-green-600' : 'text-gray-400'
            )}
        >
            <span className={cn('w-1.5 h-1.5 rounded-full', salvo ? 'bg-green-600 animate-pulse' : 'border border-gray-400')} />
            {salvo ? 'salvo' : 'auto-save'}
        </span>
    );
};
