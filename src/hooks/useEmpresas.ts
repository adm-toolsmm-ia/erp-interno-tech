'use client';

import { useApi, useApiPost } from './useApi';

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export function useEmpresas(page: number = 1, limit: number = 10) {
  const endpoint = `/api/empresas?page=${page}&limit=${limit}`;
  return useApi<Empresa[]>(endpoint);
}

export function useCreateEmpresa() {
  return useApiPost<Partial<Empresa>, Empresa>('/api/empresas');
}
