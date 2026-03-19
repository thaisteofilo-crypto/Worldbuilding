'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextInputProps {
    label?: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    size?: number;
    className?: string;
}

export const TextInput = ({ label, value, onChange, placeholder, size = 14, className }: TextInputProps) => {
    return (
        <div className={cn('mb-6', className)}>
            {label && (
                <div className="text-[10px] tracking-[3px] text-gray-400 mb-2.5 uppercase font-mono">
                    {label}
                </div>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ fontSize: size }}
                className="w-full bg-transparent border-none border-b border-gray-200 text-gray-900 py-1.5 focus:border-green-600 transition-colors placeholder:text-gray-200"
            />
        </div>
    );
};
