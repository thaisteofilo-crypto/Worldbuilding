'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ReferenceItem } from '@/lib/schemas';

interface ReferenceCardProps {
    item: ReferenceItem;
    id: string;
    aberto: boolean;
    toggle: (id: string) => void;
    tipo: string;
    cor: string;
    isLivro?: boolean;
}

export const ReferenceCard = ({
    item,
    id,
    aberto,
    toggle,
    tipo,
    cor,
    isLivro
}: ReferenceCardProps) => {
    return (
        <div
            className={cn(
                'mb-2 border rounded-lg transition-all duration-200 overflow-hidden',
                aberto
                    ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                    : 'bg-transparent border-gray-100 hover:border-gray-200'
            )}
            style={aberto ? { borderColor: `${cor}44` } : {}}
        >
            <button
                onClick={() => toggle(id)}
                className="w-full text-left p-[14px_18px] flex items-start gap-3.5 bg-none border-none group"
            >
                <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-[15px] text-gray-900 font-medium group-hover:text-green-600 transition-colors">
                            {item.titulo}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono italic">
                            {isLivro ? item.obras : (item.ano || tipo)}
                        </span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                        {item.tags.map((t, i) => (
                            <span
                                key={i}
                                className="text-[9px] tracking-[1.5px] uppercase font-mono px-2 py-0.5 rounded-sm border transition-colors"
                                style={{ color: cor, borderColor: `${cor}33` }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
                <span
                    className={cn(
                        'text-[11px] text-gray-300 transition-transform duration-200 pt-0.5',
                        aberto ? 'rotate-180' : 'rotate-0'
                    )}
                >
                    ▼
                </span>
            </button>
            {aberto && (
                <div className="px-[18px] pb-[18px] border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[14px] leading-[1.8] text-gray-500 my-[14px]">
                        {item.como}
                    </p>
                    <div className="bg-green-50 border-l-[3px] border-green-600 p-[12px_16px] rounded-r-lg">
                        <div className="text-[10px] text-green-600 tracking-[2px] uppercase font-mono font-semibold">
                            O que absorver
                        </div>
                        <p className="mt-2 text-[13px] leading-[1.7] text-gray-500 italic">
                            {item.absorver}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
