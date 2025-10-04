'use client';

import { useApi, useApiPost } from './useApi';

export interface Orcamento {
  id: string;
  titulo: string;
  descricao?: string;
  projetoId: string;
  fornecedorId?: string;
  valorTotal: number;
  moeda: string;
  status: 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'EXECUTADO';
  dataCriacao: string;
  dataValidade?: string;
  observacoes?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  projeto?: {
    assunto: string;
    cliente?: {
      razaoSocial: string;
    };
  };
  fornecedor?: {
    nome: string;
  };
}

export function useOrcamentos(page: number = 1, limit: number = 10) {
  const endpoint = `/api/orcamentos?page=${page}&limit=${limit}`;
  return useApi<Orcamento[]>(endpoint);
}

export function useCreateOrcamento() {
  return useApiPost<Partial<Orcamento>, Orcamento>('/api/orcamentos');
}
