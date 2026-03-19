'use client';

import React, { useState } from 'react';
import { ReferenceTabs } from '@/components/studio/ReferenceTabs';
import { ReferenceCard } from '@/components/studio/ReferenceCard';

const REF_DATA = {
    intro: 'Esta célula reúne o universo de referências que alimenta o projeto — não como lista de influências, mas como mapa de forças. Cada obra aqui opera em alguma camada: na voz, na estrutura, na premissa ontológica, no tom, na recusa ao arco de superação.',
    citadas: {
        series: [
            { id: 's-1', titulo: 'Carol e o Fim do Mundo', ano: 'Netflix, 2023', tags: ['premissa central', 'estrutura episódica', 'inadequação ontológica'], como: 'A origem direta do primeiro capítulo. Carol é O Entre em forma de animação: não consegue habitar o fim do mundo do jeito certo enquanto todos performam sentido.', absorver: 'Inadequação como condição permanente; personagens ao redor como pressão sem salvação; ausência total de arco de superação.' },
            { id: 's-2', titulo: 'The Midnight Gospel', ano: 'Netflix, 2020', tags: ['presença corporal', 'dissociação', 'função de Ana'], como: 'A série separa narrativa e conteúdo — o que acontece visualmente e o que é dito não se explicam mutuamente. Ressoa com a dissociação da protagonista.', absorver: 'Presença corporal mínima como único sentido possível; a morte como colapso irrespondível do tempo; dissociação entre exterior e interior.' },
            { id: 's-3', titulo: 'Desencanto', ano: 'Netflix, 2018–2023', tags: ['recusa ao papel', 'uso restrito', 'Helena'], como: 'Uso restrito. Bean recusa o papel destinado sem saber o que colocar no lugar. Luci é externalização de um estado interno que não se nomeia: parentesco com Helena.', absorver: 'Apenas: a recusa inicial ao papel destinado sem alternativa clara; Luci como voz da desistência que acompanha sem decidir.' },
        ],
        livros: [
            { id: 'l-1', titulo: 'Clarice Lispector', obras: 'A Paixão Segundo G.H. / Água Viva / Laços de Família', tags: ['voz', 'sintaxe', 'percepção antes da palavra'], como: 'A influência mais estrutural. O que importa absorver não é o "jeito Clarice" como maneirismo, mas o movimento específico do pensamento: a percepção chega antes da palavra.', absorver: 'Sintaxe do pensamento em fluxo; percepção anterior à explicação; tensão entre palavra e silêncio; a linguagem que tenta e falha.' },
        ]
    },
    sustentacao: [
        {
            categoria: 'Para o Colapso Simbólico do Tempo', cor: '#D97706', itens: [
                { id: 'c-1', titulo: 'The Leftovers', tipo: 'série · HBO', tags: ['premissa ontológica', 'estratégias de sobrevivência'], como: 'A série que mais diretamente trabalha o colapso simbólico do tempo. A série nunca explica.', absorver: 'Personagens como estratégias de sobrevivência ontológica; recusa de explicação como princípio estrutural.' }
            ]
        }
    ],
    conclusao: 'O mapa acima não é uma lista de leituras obrigatórias. É um conjunto de forças que já atuam ou podem atuar na escrita.'
};

export default function ReferenciasPage() {
    const [activeTab, setActiveTab] = useState('citadas');
    const [itemAberto, setItemAberto] = useState<string | null>(null);

    const tabs = [
        { id: 'citadas', label: 'Referências Citadas' },
        { id: 'sustentacao', label: 'Sustentação' },
        { id: 'conclusao', label: 'Síntese' }
    ];

    const toggle = (id: string) => setItemAberto(itemAberto === id ? null : id);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-[36px_44px_24px] border-b border-gray-100 flex-shrink-0">
                <div className="text-[10px] tracking-[3.5px] text-gray-400 mb-3 uppercase font-mono font-semibold">REF · MythQuill</div>
                <h1 className="text-28 font-bold text-gray-900 tracking-tight">Referências</h1>
                <p className="mt-3 text-[14px] leading-relaxed text-gray-500 max-w-[620px]">{REF_DATA.intro}</p>
            </div>

            <ReferenceTabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setActiveTab(id); setItemAberto(null); }} />

            <div className="flex-1 overflow-y-auto p-11">
                <div className="max-w-[860px]">
                    {activeTab === 'citadas' && (
                        <>
                            <div className="mb-9">
                                <h2 className="text-[17px] font-bold text-gray-900 mb-1">Séries citadas</h2>
                                <p className="text-[12px] text-gray-400 mb-5">Já operam na escrita consciente ou inconscientemente</p>
                                {REF_DATA.citadas.series.map(item => (
                                    <ReferenceCard key={item.id} id={item.id} item={item as any} aberto={itemAberto === item.id} toggle={toggle} tipo="série" cor="#D97706" />
                                ))}
                            </div>
                            <div>
                                <h2 className="text-[17px] font-bold text-gray-900 mb-1">Autoras citadas</h2>
                                <p className="text-[12px] text-gray-400 mb-5">Referências estéticas, éticas e estruturais declaradas</p>
                                {REF_DATA.citadas.livros.map(item => (
                                    <ReferenceCard key={item.id} id={item.id} item={item as any} aberto={itemAberto === item.id} toggle={toggle} tipo="livro" cor="#CA8A04" isLivro />
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'sustentacao' && REF_DATA.sustentacao.map((cat, ci) => (
                        <div key={ci} className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: cat.cor }} />
                                <h2 className="text-[11px] tracking-widest font-bold uppercase font-mono" style={{ color: cat.cor }}>{cat.categoria}</h2>
                            </div>
                            {cat.itens.map(item => (
                                <ReferenceCard key={item.id} id={item.id} item={item as any} aberto={itemAberto === item.id} toggle={toggle} tipo={item.tipo} cor={cat.cor} />
                            ))}
                        </div>
                    ))}

                    {activeTab === 'conclusao' && (
                        <div className="border-l-4 border-green-600 pl-7 text-[15px] leading-relaxed text-gray-600 whitespace-pre-line italic">
                            {REF_DATA.conclusao}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
