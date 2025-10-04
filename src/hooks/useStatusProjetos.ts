'use client';

import { useApi, useApiPost } from './useApi';

export interface StatusProjeto {
  id: string;
  nome: string;
  descricao?: string;
  fase?: string;
  cor?: string;
  ordem?: number;
  ativo?: boolean;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export function useStatusProjetos(page: number = 1, limit: number = 10) {
  const endpoint = `/api/status-projetos?page=${page}&limit=${limit}`;
  return useApi<StatusProjeto[]>(endpoint);
}

export function useCreateStatusProjeto() {
  return useApiPost<Partial<StatusProjeto>, StatusProjeto>('/api/status-projetos');
}
