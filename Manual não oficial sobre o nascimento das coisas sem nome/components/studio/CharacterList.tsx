'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Character } from '@/lib/schemas';
import { SaveIndicator } from './SaveIndicator';

interface CharacterListProps {
    characters: Character[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    salvo: boolean;
}

export const CharacterList = ({ characters, selectedId, onSelect, onAdd, salvo }: CharacterListProps) => {
    return (
        <div className="w-[252px] border-r border-gray-100 flex flex-col bg-gray-50 flex-shrink-0">
            <div className="p-[20px_18px_14px] border-b border-gray-100">
                <div className="text-[10px] tracking-[3px] text-gray-400 mb-2.5 uppercase font-mono font-semibold">
                    PER · Entidades
                </div>
                <button
                    onClick={onAdd}
                    className="w-full py-2 bg-green-600 text-white border-none rounded-lg text-[11px] tracking-[1.5px] uppercase font-mono font-semibold transition-colors hover:bg-green-700 active:scale-95 shadow-sm"
                >
                    + Novo Personagem
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {characters.map((p) => {
                    const isSelected = selectedId === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            className={cn(
                                'flex items-center gap-2.5 w-full p-[13px_18px] border-none text-left transition-all duration-150 relative group',
                                isSelected ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-gray-100'
                            )}
                        >
                            {isSelected && (
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                                    style={{ backgroundColor: p.cor }}
                                />
                            )}
                            <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: p.cor }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    'text-[13px] truncate transition-colors',
                                    isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'
                                )}>
                                    {p.nome || '—'}
                                </div>
                                <div
                                    className="text-[10px] mt-0.5 font-mono tracking-wide"
                                    style={{ color: p.cor }}
                                >
                                    {p.funcao || 'sem função'}
                                </div>
                            </div>
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
