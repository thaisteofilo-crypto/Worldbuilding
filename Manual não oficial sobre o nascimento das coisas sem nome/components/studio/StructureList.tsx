'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChapterCell, MICROESTADOS, STATUS_CAP } from '@/lib/schemas';
import { SaveIndicator } from './SaveIndicator';

interface StructureListProps {
    caps: ChapterCell[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    salvo: boolean;
}

export const StructureList = ({ caps, selectedId, onSelect, onAdd, salvo }: StructureListProps) => {
    return (
        <div className="w-[252px] border-r border-gray-100 flex flex-col bg-gray-50 flex-shrink-0">
            <div className="p-[20px_18px_14px] border-b border-gray-100">
                <div className="text-[10px] tracking-[3px] text-gray-400 mb-2.5 uppercase font-mono font-semibold">
                    EST · Células
                </div>
                <button
                    onClick={onAdd}
                    className="w-full py-2 bg-green-600 text-white border-none rounded-lg text-[11px] tracking-[1.5px] uppercase font-mono font-semibold transition-colors hover:bg-green-700 active:scale-95 shadow-sm"
                >
                    + Nova Célula
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {caps.length === 0 && (
                    <div className="p-10 text-center">
                        <p className="text-[13px] text-gray-400 italic">Nenhuma célula ainda.</p>
                    </div>
                )}
                {caps.map((c) => {
                    const ms = MICROESTADOS[c.microestado] || MICROESTADOS.dissociacao;
                    const isSelected = selectedId === c.id;
                    return (
                        <button
                            key={c.id}
                            onClick={() => onSelect(c.id)}
                            className={cn(
                                'flex items-center gap-2.5 w-full p-[12px_18px] border-none text-left transition-all duration-150 relative group',
                                isSelected ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-gray-100'
                            )}
                        >
                            {isSelected && (
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                                    style={{ backgroundColor: ms.cor }}
                                />
                            )}
                            <span className="text-[9px] text-gray-300 font-mono w-[18px] flex-shrink-0">
                                {String(c.numero).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    'text-[13px] truncate transition-colors',
                                    isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'
                                )}>
                                    {c.titulo || '—'}
                                </div>
                                <div className="text-[10px] mt-0.5 font-mono tracking-wide" style={{ color: ms.cor }}>
                                    {ms.label}
                                </div>
                            </div>
                            <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: STATUS_CAP[c.status]?.cor || '#C5C5C5' }}
                            />
                        </button>
                    );
                })}
            </div>
            <div className="p-[12px_18px] border-t border-gray-100 bg-white">
                <SaveIndicator salvo={salvo} />
            </div>
        </div>
    );
};
