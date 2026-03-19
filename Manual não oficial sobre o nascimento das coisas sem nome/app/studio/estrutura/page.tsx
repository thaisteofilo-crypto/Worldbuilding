'use client';

import React, { useState, useEffect } from 'react';
import { loadKey, saveKey } from '@/lib/storage';
import { ChapterCell, DEFAULT_CHAPTER } from '@/lib/schemas';
import { StructureList } from '@/components/studio/StructureList';
import { StructureEditor } from '@/components/studio/StructureEditor';

export default function EstruturaPage() {
    const [caps, setCaps] = useState<ChapterCell[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [salvo, setSalvo] = useState(false);

    useEffect(() => {
        setCaps(loadKey('estrutura', []));
    }, []);

    useEffect(() => {
        if (caps.length > 0) {
            saveKey('estrutura', caps);
            setSalvo(true);
            const t = setTimeout(() => setSalvo(false), 1500);
            return () => clearTimeout(t);
        }
    }, [caps]);

    const addCap = () => {
        const novo: ChapterCell = {
            ...DEFAULT_CHAPTER,
            id: Date.now().toString(),
            numero: caps.length + 1
        };
        setCaps([...caps, novo]);
        setSelectedId(novo.id);
    };

    const updateCap = (id: string, field: keyof ChapterCell, val: any) => {
        setCaps(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
    };

    const deleteCap = (id: string) => {
        const remaining = caps.filter(c => c.id !== id).map((c, i) => ({ ...c, numero: i + 1 }));
        setCaps(remaining);
        setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    };

    const selectedCap = caps.find(c => c.id === selectedId);

    return (
        <div className="flex h-full overflow-hidden">
            <StructureList
                caps={caps}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdd={addCap}
                salvo={salvo}
            />
            {selectedCap ? (
                <StructureEditor
                    cap={selectedCap}
                    onUpdate={updateCap}
                    onDelete={deleteCap}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                    <p className="text-gray-400 italic">Selecione ou crie uma célula para começar.</p>
                </div>
            )}
        </div>
    );
}
