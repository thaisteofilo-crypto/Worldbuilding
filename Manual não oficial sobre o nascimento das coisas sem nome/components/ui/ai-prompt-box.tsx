'use client';

import React, { useState, useEffect } from 'react';
import { loadKey, saveKey } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface LogEntry {
    id: number;
    message: string;
    ts: string;
    context?: string;
}

export const AIPromptBox = () => {
    const [msg, setMsg] = useState('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        setLogs(loadKey('logs', []));
    }, []);

    const send = () => {
        if (!msg.trim()) return;
        const entry: LogEntry = {
            id: Date.now(),
            message: msg.trim(),
            ts: new Date().toISOString(),
            context: 'studio',
        };
        const updated = [entry, ...logs].slice(0, 50);
        setLogs(updated);
        saveKey('logs', updated);
        setMsg('');
    };

    return (
        <div className="w-full">
            {showLogs && logs.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto px-5 py-2.5 border-t border-gray-100 bg-gray-50 text-[12px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase font-semibold">Histórico</span>
                        <button onClick={() => setShowLogs(false)} className="text-gray-400 text-[11px] hover:text-gray-600">fechar</button>
                    </div>
                    {logs.slice(0, 10).map((l) => (
                        <div key={l.id} className="py-1.5 border-b border-gray-100 flex gap-2.5">
                            <span className="text-[10px] text-gray-300 font-mono flex-shrink-0">
                                {new Date(l.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-gray-600">{l.message}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="border-t border-gray-100 bg-white px-5 py-2.5 flex gap-2.5 items-center">
                <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="text-gray-400 text-[16px] px-1 transition-transform"
                    style={{ transform: showLogs ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >
                    ▼
                </button>
                <input
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] focus:border-green-600 transition-colors"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Digite uma anotação, pergunta ou prompt..."
                    onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                />
                <button
                    onClick={send}
                    className="px-5 py-2 bg-green-600 text-white border-none rounded-lg text-[12px] font-semibold tracking-wide transition-colors hover:bg-green-700 active:scale-95 whitespace-nowrap"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
};
