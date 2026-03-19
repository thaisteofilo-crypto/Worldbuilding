export interface ReferenceItem {
    id: string;
    titulo: string;
    tags: string[];
    status: 'citadas' | 'sustentacao' | 'sintese';
    ano?: string;
    como: string;
    absorver: string;
    obras?: string; // For books
}

export interface ChapterCell {
    id: string;
    numero: number;
    titulo: string;
    microestado: string;
    presencaCorporal: number;
    status: 'rascunho' | 'desenvolvimento' | 'completo';
    oQueAcontece: string;
    oQueESentido: string;
    notas: string;
    palavras: number;
}

export interface Character {
    id: string;
    nome: string;
    funcao: string;
    funcaoDesc: string;
    estrategia: string;
    pressao: string;
    notas: string;
    caps: string[]; // IDs of linked chapters
    cor: string;
}

export const DEFAULT_CHAPTER: ChapterCell = {
    id: '',
    numero: 0,
    titulo: '',
    microestado: 'dissociacao',
    presencaCorporal: 3,
    status: 'rascunho',
    oQueAcontece: '',
    oQueESentido: '',
    notas: '',
    palavras: 0,
};

export const DEFAULT_CHARACTER: Character = {
    id: '',
    nome: '',
    funcao: '',
    funcaoDesc: '',
    estrategia: '',
    pressao: '',
    notas: '',
    caps: [],
    cor: '#16a34a',
};

export const MICROESTADOS: Record<string, { label: string; cor: string; descricao: string }> = {
    dissociacao: { label: 'Dissociação', cor: '#6B7B8D', descricao: 'Presente mas ausente' },
    sedimentacao: { label: 'Sedimentação', cor: '#D97706', descricao: 'Acúmulo sem sentido' },
    pressao_relacional: { label: 'Pressão Relacional', cor: '#DC2626', descricao: 'Outro como câmara' },
    suspensao: { label: 'Suspensão', cor: '#7C3AED', descricao: 'Tempo que circula' },
    ruptura_contida: { label: 'Ruptura Contida', cor: '#5A8A5A', descricao: 'Fratura sem resolução' },
    presenca_parcial: { label: 'Presença Parcial', cor: '#92400E', descricao: 'Corpo antes da mente' },
    linguagem_falha: { label: 'Linguagem Falha', cor: '#CA8A04', descricao: 'A palavra que trai' },
};

export const STATUS_CAP: Record<string, { label: string; cor: string }> = {
    rascunho: { label: 'Rascunho', cor: '#B0B0B0' },
    desenvolvimento: { label: 'Em construção', cor: '#CA8A04' },
    completo: { label: 'Completo', cor: '#16a34a' },
};
