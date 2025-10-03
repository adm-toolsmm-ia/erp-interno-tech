# 📋 ERP Módulos — ERPInternoTech

## Visão Geral dos Módulos

O ERP Interno Tech está organizado em módulos funcionais que cobrem os principais processos de negócio da empresa Tech. Cada módulo é independente mas integrado, seguindo os princípios de multi-tenancy e soft delete.

## 🏢 Módulo Empresa

### Funcionalidades
- **Gestão de dados** da empresa
- **Configurações** de sistema
- **Usuários** e permissões (Fase 2)
- **Integrações** externas

### Campos Principais
```typescript
interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  website?: string;
  logo?: string;
  configuracoes: {
    timezone: string;
    moeda: string;
    formatoData: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Regras de Negócio
- **CNPJ único** por empresa
- **Razão social** obrigatória
- **Configurações** padrão para Brasil
- **Soft delete** com auditoria

## 👥 Módulo Cliente

### Funcionalidades
- **Cadastro** de clientes
- **Validação** de CNPJ
- **Histórico** de relacionamento
- **Representantes** e contatos

### Campos Principais
```typescript
interface Cliente {
  id: string;
  empresaId: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
    website?: string;
  };
  representantes: Representante[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Regras de Negócio
- **CNPJ válido** obrigatório
- **Razão social** única por empresa
- **Endereço** completo obrigatório
- **Representantes** podem ser múltiplos

## 🚀 Módulo Projeto

### Funcionalidades
- **Gestão** de projetos
- **Workflow** de status
- **Cronograma** básico
- **Relatórios** de progresso

### Campos Principais
```typescript
interface Projeto {
  id: string;
  empresaId: string;
  clienteId: string;
  assunto: string;
  descricao?: string;
  statusId: string;
  dataEntrada: Date;
  dataInicio?: Date;
  dataFim?: Date;
  expectativa?: string;
  objetivo?: string;
  observacoes?: string;
  valorEstimado?: number;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Status Padronizados
- **Prospecção** → Projeto em fase inicial
- **Em andamento** → Projeto em execução
- **Concluído** → Projeto finalizado
- **Cancelado** → Projeto cancelado
- **Pausado** → Projeto temporariamente pausado

### Regras de Negócio
- **Cliente** obrigatório
- **Assunto** obrigatório
- **Data de entrada** obrigatória
- **Data de fim** deve ser posterior à data de início
- **Status** segue workflow definido

## 📄 Módulo Documento

### Funcionalidades
- **Upload** de documentos
- **Versionamento** automático
- **Categorização** inteligente
- **Busca semântica** com IA

### Campos Principais
```typescript
interface Documento {
  id: string;
  empresaId: string;
  projetoId?: string;
  clienteId?: string;
  titulo: string;
  descricao?: string;
  categoriaId: string;
  versao: number;
  storageKey: string;
  contentType: string;
  tamanho: number;
  hash: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Categorias Padrão
- **Proposta Comercial**
- **Contrato**
- **Ata de Reunião**
- **Relatório Técnico**
- **Orçamento**
- **Outros**

### Regras de Negócio
- **Título** obrigatório
- **Categoria** obrigatória
- **Versionamento** automático
- **Hash** para integridade
- **Busca semântica** com embeddings

## 💰 Módulo Orçamento

### Funcionalidades
- **Criação** de orçamentos
- **Workflow** de aprovação
- **Cálculos** automáticos
- **Relatórios** financeiros

### Campos Principais
```typescript
interface Orcamento {
  id: string;
  empresaId: string;
  projetoId: string;
  clienteId: string;
  numero: string;
  titulo: string;
  descricao?: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado';
  dataCriacao: Date;
  dataValidade: Date;
  valorTotal: number;
  desconto?: number;
  valorFinal: number;
  observacoes?: string;
  itens: OrcamentoItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Workflow de Aprovação
1. **Rascunho** → Orçamento sendo criado
2. **Enviado** → Orçamento enviado ao cliente
3. **Aprovado** → Cliente aprovou o orçamento
4. **Rejeitado** → Cliente rejeitou o orçamento
5. **Expirado** → Orçamento expirou

### Regras de Negócio
- **Projeto** obrigatório
- **Cliente** obrigatório
- **Valor total** calculado automaticamente
- **Data de validade** obrigatória
- **Status** segue workflow definido

## 🔗 Relacionamentos entre Módulos

### Hierarquia
```
Empresa
├── Clientes
│   ├── Projetos
│   │   ├── Documentos
│   │   └── Orçamentos
│   └── Representantes
└── Usuários (Fase 2)
```

### Integrações
- **Projeto ↔ Cliente**: Relacionamento obrigatório
- **Documento ↔ Projeto**: Relacionamento opcional
- **Orçamento ↔ Projeto**: Relacionamento obrigatório
- **Representante ↔ Cliente**: Relacionamento opcional

## 📊 Métricas por Módulo

### Empresa
- Total de clientes ativos
- Total de projetos em andamento
- Receita total do período
- Taxa de conversão de orçamentos

### Cliente
- Total de projetos por cliente
- Valor total de orçamentos
- Tempo médio de resposta
- Satisfação do cliente

### Projeto
- Projetos por status
- Tempo médio de execução
- Projetos por prioridade
- Projetos por cliente

### Documento
- Total de documentos por categoria
- Tamanho médio dos arquivos
- Documentos por projeto
- Taxa de versionamento

### Orçamento
- Orçamentos por status
- Valor total de orçamentos
- Taxa de aprovação
- Tempo médio de aprovação

## 🎯 Próximos Passos

### Fase 1 (MVP)
- [ ] Implementar CRUDs básicos
- [ ] Configurar multi-tenancy
- [ ] Implementar soft delete
- [ ] Criar dashboards básicos

### Fase 2 (Autenticação)
- [ ] Implementar JWT/Supabase Auth
- [ ] Configurar RBAC
- [ ] Gerenciar usuários
- [ ] Auditoria de acesso

### Fase 3 (Integrações)
- [ ] Integração com email
- [ ] Integração com pagamentos
- [ ] Integração com CRM
- [ ] API externa

### Fase 4 (IA Avançada)
- [ ] Análise de sentimento
- [ ] Previsão de vendas
- [ ] Otimização de processos
- [ ] Chatbot avançado
