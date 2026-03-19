'use client';

import React from 'react';
import { Character, ChapterCell, MICROESTADOS } from '@/lib/schemas';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { cn } from '@/lib/utils';

interface CharacterEditorProps {
    character: Character;
    caps: ChapterCell[];
    onUpdate: (id: string, field: keyof Character, value: any) => void;
    onDelete: (id: string) => void;
    onToggleCap: (charId: string, capId: string) => void;
}

export const CharacterEditor = ({
    character,
    caps,
    onUpdate,
    onDelete,
    onToggleCap
}: CharacterEditorProps) => {
    return (
        <div className="flex-1 overflow-y-auto p-[36px_48px_60px] bg-white">
            <div className="max-w-[680px]">
                <div className="flex items-center gap-3 mb-8">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: character.cor }}
                    />
                    <span className="text-[10px] tracking-[3px] text-gray-400 font-mono text-uppercase font-semibold uppercase">
                        personagem
                    </span>
                    <button
                        onClick={() => onDelete(character.id)}
                        className="ml-auto bg-none border-none text-gray-300 text-[11px] font-mono hover:text-red-400 transition-colors"
                    >
                        remover
                    </button>
                </div>

                <TextInput
                    label="Nome"
                    value={character.nome}
                    onChange={(v) => onUpdate(character.id, 'nome', v)}
                    placeholder="nome ou designação"
                    size={22}
                />
                <TextInput
                    label="Função no sistema"
                    value={character.funcao}
                    onChange={(v) => onUpdate(character.id, 'funcao', v)}
                    placeholder="função ontológica (não papel dramático)"
                />
                <TextArea
                    label="Descrição da função"
                    value={character.funcaoDesc as any} // character interface needs adjustment for funcaoDesc if it was there
                    onChange={(v) => onUpdate(character.id, 'funcaoDesc' as any, v)}
                    rows={2}
                    placeholder="o que este personagem representa no sistema narrativo..."
                />
                <TextArea
                    label="Estratégia de sobrevivência"
                    value={character.estrategia}
                    onChange={(v) => onUpdate(character.id, 'estrategia', v)}
                    rows={3}
                    placeholder="como existe. não como supera — como persiste."
                />
                <TextArea
                    label="Como pressiona sem salvar"
                    value={character.pressao}
                    onChange={(v) => onUpdate(character.id, 'pressao', v)}
                    rows={3}
                    placeholder="mecanismo de pressão sobre a protagonista. sem resolução."
                />

                {caps.length > 0 && (
                    <div className="mb-7">
                        <div className="text-[10px] tracking-[2.5px] text-gray-400 mb-3.5 uppercase font-mono font-semibold">
                            Aparece nas células
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {caps.map((c) => {
                                const isAtivo = character.caps.includes(c.id);
                                const msCor = MICROESTADOS[c.microestado]?.cor || '#7A7A7A';
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => onToggleCap(character.id, c.id)}
                                        className={cn(
                                            'px-3.5 py-1.5 border rounded-lg text-[10px] tracking-[1.5px] font-mono uppercase transition-all duration-150',
                                        )}
                                        style={{
                                            borderColor: isAtivo ? msCor : '#E3E3E0',
                                            backgroundColor: isAtivo ? `${msCor}14` : 'transparent',
                                            color: isAtivo ? msCor : '#7A7A7A',
                                            fontWeight: isAtivo ? 600 : 400
                                        }}
                                    >
                                        {String(c.numero).padStart(2, '0')} {c.titulo || '—'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <TextArea
                    label="Notas"
                    value={character.notas}
                    onChange={(v) => onUpdate(character.id, 'notas', v)}
                    rows={3}
                    placeholder="contexto, inspirações, conexões com referências..."
                />
            </div>
        </div>
    );
};
