'use client';

import React from 'react';
import { ChapterCell, MICROESTADOS, STATUS_CAP } from '@/lib/schemas';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { Dots } from './Dots';

interface StructureEditorProps {
    cap: ChapterCell;
    onUpdate: (id: string, field: keyof ChapterCell, value: any) => void;
    onDelete: (id: string) => void;
}

export const StructureEditor = ({ cap, onUpdate, onDelete }: StructureEditorProps) => {
    const m = MICROESTADOS[cap.microestado] || MICROESTADOS.dissociacao;

    return (
        <div className="flex-1 overflow-y-auto p-[36px_48px_60px] bg-white">
            <div className="max-w-[680px]">
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-[11px] text-gray-400 font-mono tracking-[2px] font-semibold">
                        CÉLULA {String(cap.numero).padStart(2, '0')}
                    </span>
                    <select
                        value={cap.status}
                        onChange={(e) => onUpdate(cap.id, 'status', e.target.value)}
                        className="bg-white border border-gray-100 text-[10px] tracking-wider font-mono px-2.5 py-1 text-gray-600 uppercase rounded cursor-pointer hover:border-green-600 transition-colors"
                        style={{ color: STATUS_CAP[cap.status]?.cor }}
                    >
                        {Object.entries(STATUS_CAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => onDelete(cap.id)}
                        className="ml-auto bg-none border-none text-gray-300 text-[11px] font-mono hover:text-red-400 transition-colors"
                    >
                        remover
                    </button>
                </div>

                <TextInput
                    label=""
                    value={cap.titulo}
                    onChange={(v) => onUpdate(cap.id, 'titulo', v)}
                    placeholder="título da célula (opcional)"
                    size={24}
                />

                <div className="mb-7">
                    <div className="text-[10px] tracking-[2.5px] text-gray-400 mb-3.5 uppercase font-mono font-semibold">
                        Microestado
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(MICROESTADOS).map(([k, v]) => (
                            <button
                                key={k}
                                onClick={() => onUpdate(cap.id, 'microestado', k)}
                                className="px-3.5 py-1.5 border rounded-lg text-[10px] tracking-[1.5px] font-mono uppercase transition-all duration-150"
                                style={{
                                    borderColor: cap.microestado === k ? v.cor : '#E3E3E0',
                                    backgroundColor: cap.microestado === k ? `${v.cor}14` : 'transparent',
                                    color: cap.microestado === k ? v.cor : '#7A7A7A',
                                    fontWeight: cap.microestado === k ? 600 : 400
                                }}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>
                    {m && (
                        <div className="mt-2.5 text-[12px] text-gray-400 italic">
                            {m.descricao}
                        </div>
                    )}
                </div>

                <div className="mb-7">
                    <div className="text-[10px] tracking-[2.5px] text-gray-400 mb-3 uppercase font-mono font-semibold">
                        Presença Corporal
                    </div>
                    <div className="flex items-center gap-4">
                        <Dots
                            value={cap.presencaCorporal}
                            onChange={(v) => onUpdate(cap.id, 'presencaCorporal', v)}
                            cor="#16a34a"
                        />
                        <span className="text-[12px] text-gray-400">
                            {['', 'mínima', 'baixa', 'parcial', 'presente', 'plena'][cap.presencaCorporal]}
                        </span>
                    </div>
                </div>

                <div className="mb-7">
                    <div className="text-[10px] tracking-[2.5px] text-gray-400 mb-2.5 uppercase font-mono font-semibold">
                        Contagem de palavras
                    </div>
                    <input
                        type="number"
                        value={cap.palavras || ''}
                        onChange={(e) => onUpdate(cap.id, 'palavras', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-transparent border-none border-b border-gray-100 text-gray-900 text-[16px] py-1 w-24 font-mono focus:border-green-600 transition-colors"
                    />
                </div>

                <TextArea
                    label="O que acontece"
                    value={cap.oQueAcontece}
                    onChange={(v) => onUpdate(cap.id, 'oQueAcontece', v)}
                    rows={4}
                    placeholder="eventos externos, o que a câmara vê..."
                />
                <TextArea
                    label="O que é sentido"
                    value={cap.oQueESentido}
                    onChange={(v) => onUpdate(cap.id, 'oQueESentido', v)}
                    rows={4}
                    placeholder="registro interno, ou a falha em registrar..."
                />
                <TextArea
                    label="Notas"
                    value={cap.notas}
                    onChange={(v) => onUpdate(cap.id, 'notas', v)}
                    rows={3}
                    placeholder="anotações, conexões, questões em aberto..."
                />
            </div>
        </div>
    );
};
