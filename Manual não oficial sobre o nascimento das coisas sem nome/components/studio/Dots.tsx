'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DotsProps {
    value: number;
    onChange?: (val: number) => void;
    max?: number;
    cor?: string;
}

export const Dots = ({ value, onChange, max = 5, cor = '#16a34a' }: DotsProps) => {
    return (
        <div className="flex gap-1.5">
            {Array.from({ length: max }, (_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange && onChange(i + 1)}
                    className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        i < value ? 'bg-green-600' : 'bg-gray-200',
                        onChange ? 'cursor-pointer hover:bg-green-400' : 'cursor-default'
                    )}
                    style={i < value && cor !== '#16a34a' ? { backgroundColor: cor } : {}}
                />
            ))}
        </div>
    );
};
