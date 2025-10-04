'use client';

import { useApi, useApiPost } from './useApi';

export interface Documento {
  id: string;
  titulo: string;
  descricao?: string;
  tipo?: string;
  url?: string;
  categoriaId?: string;
  projetoId?: string;
  clienteId?: string;
  versao?: string;
  observacoes?: string;
  storageKey?: string;
  contentType?: string;
  sizeBytes?: number;
  checksum?: string;
  currentVersion?: number;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  categoria?: {
    nome: string;
  };
  projeto?: {
    assunto: string;
  };
  cliente?: {
    razaoSocial: string;
  };
}

export function useDocumentos(page: number = 1, limit: number = 10) {
  const endpoint = `/api/documentos?page=${page}&limit=${limit}`;
  return useApi<Documento[]>(endpoint);
}

export function useCreateDocumento() {
  return useApiPost<Partial<Documento>, Documento>('/api/documentos');
}
