'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps {
    label?: string;
    value: string;
    onChange: (val: string) => void;
    rows?: number;
    placeholder?: string;
    className?: string;
}

export const TextArea = ({ label, value, onChange, rows = 4, placeholder, className }: TextAreaProps) => {
    return (
        <div className={cn('mb-7', className)}>
            {label && (
                <div className="text-[10px] tracking-[3px] text-gray-400 mb-2.5 uppercase font-mono">
                    {label}
                </div>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
                className="w-full bg-transparent border-none border-b border-gray-100 text-gray-700 text-[14px] leading-[1.85] py-2 focus:border-green-600 transition-colors resize-vertical placeholder:text-gray-200"
            />
        </div>
    );
};
