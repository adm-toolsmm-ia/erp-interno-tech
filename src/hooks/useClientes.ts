'use client';

import { useApi, useApiPost } from './useApi';

export interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  observacoes?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export function useClientes(page: number = 1, limit: number = 10) {
  const endpoint = `/api/clientes?page=${page}&limit=${limit}`;
  return useApi<Cliente[]>(endpoint);
}

export function useCreateCliente() {
  return useApiPost<Partial<Cliente>, Cliente>('/api/clientes');
}
