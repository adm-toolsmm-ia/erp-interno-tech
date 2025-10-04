'use client';

import { useApi, useApiPost } from './useApi';

export interface Projeto {
  id: string;
  assunto: string;
  descricao?: string;
  dataEntrada: string;
  dataInicio?: string;
  dataFim?: string;
  orcamento?: number;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  statusId?: string;
  clienteId: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    razaoSocial: string;
    nomeFantasia?: string;
  };
  status?: {
    nome: string;
    fase?: string;
  };
}

export function useProjetos(page: number = 1, limit: number = 10) {
  const endpoint = `/api/projetos?page=${page}&limit=${limit}`;
  return useApi<Projeto[]>(endpoint);
}

export function useCreateProjeto() {
  return useApiPost<Partial<Projeto>, Projeto>('/api/projetos');
}
