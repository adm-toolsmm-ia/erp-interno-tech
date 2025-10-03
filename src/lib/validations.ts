import { z } from 'zod';

// Schema base para multi-tenancy
export const tenantSchema = z.object({
  empresaId: z.string().uuid('ID da empresa deve ser um UUID válido'),
});

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para filtros de data
export const dateFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Schema para Empresa
export const createEmpresaSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  nomeFantasia: z.string().min(1, 'Nome fantasia é obrigatório'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  website: z.string().url('Website inválido').optional(),
  logo: z.string().optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  moeda: z.string().default('BRL'),
  formatoData: z.string().default('DD/MM/YYYY'),
});

export const updateEmpresaSchema = createEmpresaSchema.partial();

// Schema para Cliente
export const createClienteSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
  segmento: z.string().optional(),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado deve ter 2 caracteres').max(2),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  website: z.string().url('Website inválido').optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

// Schema para Projeto
export const createProjetoSchema = z.object({
  clienteId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  assunto: z.string().min(1, 'Assunto é obrigatório'),
  descricao: z.string().optional(),
  statusId: z.string().uuid('ID do status deve ser um UUID válido').optional(),
  dataEntrada: z.string().datetime('Data de entrada inválida'),
  dataInicio: z.string().datetime('Data de início inválida').optional(),
  dataFim: z.string().datetime('Data de fim inválida').optional(),
  expectativa: z.string().optional(),
  objetivo: z.string().optional(),
  observacoes: z.string().optional(),
  valorEstimado: z.number().positive('Valor estimado deve ser positivo').optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  tags: z.array(z.string()).default([]),
  gerenteId: z.string().uuid('ID do gerente deve ser um UUID válido').optional(),
  vendedorId: z.string().uuid('ID do vendedor deve ser um UUID válido').optional(),
});

export const updateProjetoSchema = createProjetoSchema.partial();

// Schema para Documento
export const createDocumentoSchema = z.object({
  projetoId: z.string().uuid('ID do projeto deve ser um UUID válido').optional(),
  clienteId: z.string().uuid('ID do cliente deve ser um UUID válido').optional(),
  categoriaId: z.string().uuid('ID da categoria deve ser um UUID válido').optional(),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  storageKey: z.string().min(1, 'Storage key é obrigatória'),
  contentType: z.string().min(1, 'Content type é obrigatório'),
  sizeBytes: z.number().int().positive('Tamanho deve ser positivo'),
  checksum: z.string().optional(),
  storageProvider: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).default([]),
});

export const updateDocumentoSchema = createDocumentoSchema.partial();

// Schema para Orçamento
export const createOrcamentoSchema = z.object({
  projetoId: z.string().uuid('ID do projeto deve ser um UUID válido'),
  numero: z.string().min(1, 'Número é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  status: z.enum(['RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'EXPIRADO']).default('RASCUNHO'),
  dataValidade: z.string().datetime('Data de validade inválida'),
  moeda: z.string().default('BRL'),
  valorTotal: z.number().nonnegative('Valor total deve ser não negativo').default(0),
  desconto: z.number().nonnegative('Desconto deve ser não negativo').optional(),
  valorFinal: z.number().nonnegative('Valor final deve ser não negativo').default(0),
  observacoes: z.string().optional(),
  fornecedorId: z.string().uuid('ID do fornecedor deve ser um UUID válido').optional(),
});

export const updateOrcamentoSchema = createOrcamentoSchema.partial();

// Schema para OrçamentoItem
export const createOrcamentoItemSchema = z.object({
  orcamentoId: z.string().uuid('ID do orçamento deve ser um UUID válido'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
  precoUnitario: z.number().nonnegative('Preço unitário deve ser não negativo'),
  subtotal: z.number().nonnegative('Subtotal deve ser não negativo'),
  fornecedorId: z.string().uuid('ID do fornecedor deve ser um UUID válido').optional(),
});

export const updateOrcamentoItemSchema = createOrcamentoItemSchema.partial();

// Schema para busca
export const searchSchema = z.object({
  q: z.string().min(1, 'Termo de busca é obrigatório'),
  ...paginationSchema.shape,
});

// Schema para filtros de status
export const statusFilterSchema = z.object({
  status: z.string().optional(),
  statusId: z.string().uuid('ID do status deve ser um UUID válido').optional(),
});

// Schema para filtros de cliente
export const clienteFilterSchema = z.object({
  clienteId: z.string().uuid('ID do cliente deve ser um UUID válido').optional(),
  segmento: z.string().optional(),
});

// Schema para filtros de projeto
export const projetoFilterSchema = z.object({
  projetoId: z.string().uuid('ID do projeto deve ser um UUID válido').optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  ...statusFilterSchema.shape,
  ...clienteFilterSchema.shape,
});

// Schema para filtros de documento
export const documentoFilterSchema = z.object({
  categoriaId: z.string().uuid('ID da categoria deve ser um UUID válido').optional(),
  ...projetoFilterSchema.shape,
});

// Schema para filtros de orçamento
export const orcamentoFilterSchema = z.object({
  status: z.enum(['RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'EXPIRADO']).optional(),
  ...projetoFilterSchema.shape,
});
