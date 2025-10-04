'use client';

import { useApi, useApiPost } from './useApi';

export interface CategoriaDocumento {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  ativo?: boolean;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export function useCategoriasDocumentos(page: number = 1, limit: number = 10) {
  const endpoint = `/api/categorias-documentos?page=${page}&limit=${limit}`;
  return useApi<CategoriaDocumento[]>(endpoint);
}

export function useCreateCategoriaDocumento() {
  return useApiPost<Partial<CategoriaDocumento>, CategoriaDocumento>('/api/categorias-documentos');
}
