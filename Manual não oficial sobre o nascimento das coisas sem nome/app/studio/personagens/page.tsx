'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { loadKey, saveKey } from '@/lib/storage';
import { Character, ChapterCell, DEFAULT_CHARACTER } from '@/lib/schemas';
import { CharacterList } from '@/components/studio/CharacterList';
import { CharacterEditor } from '@/components/studio/CharacterEditor';

export default function PersonagensPage() {
    const [chars, setChars] = useState<Character[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [salvo, setSalvo] = useState(false);
    const [caps, setCaps] = useState<ChapterCell[]>([]);

    useEffect(() => {
        setChars(loadKey('personagens', []));
        setCaps(loadKey('estrutura', []));

        // Simple listener for storage changes within the same window
        const handleStorage = () => setCaps(loadKey('estrutura', []));
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        if (chars.length > 0) {
            saveKey('personagens', chars);
            setSalvo(true);
            const t = setTimeout(() => setSalvo(false), 1500);
            return () => clearTimeout(t);
        }
    }, [chars]);

    const addChar = () => {
        const novo: Character = {
            ...DEFAULT_CHARACTER,
            id: Date.now().toString(),
            nome: 'Novo Personagem'
        };
        setChars([...chars, novo]);
        setSelectedId(novo.id);
    };

    const updateChar = (id: string, field: keyof Character, val: any) => {
        setChars(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    };

    const deleteChar = (id: string) => {
        const remaining = chars.filter(p => p.id !== id);
        setChars(remaining);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    };

    const toggleCap = (charId: string, capId: string) => {
        setChars(prev => prev.map(p => {
            if (p.id === charId) {
                const has = p.caps.includes(capId);
                return { ...p, caps: has ? p.caps.filter(c => c !== capId) : [...p.caps, capId] };
            }
            return p;
        }));
    };

    const selectedChar = chars.find(p => p.id === selectedId);

    return (
        <div className="flex h-full overflow-hidden">
            <CharacterList
                characters={chars}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdd={addChar}
                salvo={salvo}
            />
            {selectedChar ? (
                <CharacterEditor
                    character={selectedChar}
                    caps={caps}
                    onUpdate={updateChar}
                    onDelete={deleteChar}
                    onToggleCap={toggleCap}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                    <p className="text-gray-400 italic">Selecione ou crie um personagem para editar.</p>
                </div>
            )}
        </div>
    );
}
