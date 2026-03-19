'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
}

interface ReferenceTabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
}

export const ReferenceTabs = ({ tabs, activeTab, onChange }: ReferenceTabsProps) => {
    return (
        <div className="flex border-b border-gray-100 px-11 bg-white flex-shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'bg-none border-none py-3.5 mr-7 text-[11px] tracking-[1.5px] uppercase font-mono font-semibold transition-all duration-200 relative',
                        activeTab === tab.id
                            ? 'text-green-600'
                            : 'text-gray-400 hover:text-gray-600'
                    )}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-green-600 rounded-full" />
                    )}
                </button>
            ))}
        </div>
    );
};
