# 📋 Pending TODOs - ERP Interno Tech

Este documento lista todos os `TODO(docs)` encontrados no código que precisam ser resolvidos com informações adicionais da documentação.

## 🔍 TODOs Encontrados

### APIs REST
- **Arquivo**: `src/app/api/empresas/route.ts`
- **Linha**: 88
- **TODO**: `// TODO: Implementar autenticação`
- **Descrição**: Campo `createdById` está sendo definido como `context.userId` mas autenticação não foi implementada
- **Ação**: Implementar sistema de autenticação JWT ou definir usuário padrão

### APIs REST - Clientes
- **Arquivo**: `src/app/api/clientes/route.ts`
- **Linha**: 92
- **TODO**: `// TODO: Implementar autenticação`
- **Descrição**: Campo `createdById` está sendo definido como `context.userId` mas autenticação não foi implementada
- **Ação**: Implementar sistema de autenticação JWT ou definir usuário padrão

### APIs REST - Projetos
- **Arquivo**: `src/app/api/projetos/route.ts`
- **Linha**: 115
- **TODO**: `// TODO: Implementar autenticação`
- **Descrição**: Campo `createdById` está sendo definido como `context.userId` mas autenticação não foi implementada
- **Ação**: Implementar sistema de autenticação JWT ou definir usuário padrão

### APIs REST - Documentos
- **Arquivo**: `src/app/api/documentos/route.ts`
- **Linha**: 135
- **TODO**: `// TODO: Implementar autenticação`
- **Descrição**: Campo `createdById` está sendo definido como `context.userId` mas autenticação não foi implementada
- **Ação**: Implementar sistema de autenticação JWT ou definir usuário padrão

### APIs REST - Orçamentos
- **Arquivo**: `src/app/api/orcamentos/route.ts`
- **Linha**: 155
- **TODO**: `// TODO: Implementar autenticação`
- **Descrição**: Campo `createdById` está sendo definido como `context.userId` mas autenticação não foi implementada
- **Ação**: Implementar sistema de autenticação JWT ou definir usuário padrão

### Páginas - Clientes
- **Arquivo**: `src/app/(erp)/clientes/page.tsx`
- **Linha**: 25
- **TODO**: `// TODO: Implementar busca de clientes via API`
- **Descrição**: Função de busca de clientes não implementada
- **Ação**: Implementar hook ou função para buscar clientes da API

- **Arquivo**: `src/app/(erp)/clientes/page.tsx`
- **Linha**: 26
- **TODO**: `// TODO: Implementar modal de criação`
- **Descrição**: Modal para criar novo cliente não implementado
- **Ação**: Criar componente de modal com formulário de criação

- **Arquivo**: `src/app/(erp)/clientes/page.tsx`
- **Linha**: 27
- **TODO**: `// TODO: Implementar drawer de edição`
- **Descrição**: Drawer para editar cliente não implementado
- **Ação**: Criar componente de drawer com formulário de edição

### Páginas - Projetos
- **Arquivo**: `src/app/(erp)/projetos/page.tsx`
- **Linha**: 25
- **TODO**: `// TODO: Implementar busca de projetos via API`
- **Descrição**: Função de busca de projetos não implementada
- **Ação**: Implementar hook ou função para buscar projetos da API

- **Arquivo**: `src/app/(erp)/projetos/page.tsx`
- **Linha**: 26
- **TODO**: `// TODO: Implementar modal de criação`
- **Descrição**: Modal para criar novo projeto não implementado
- **Ação**: Criar componente de modal com formulário de criação

- **Arquivo**: `src/app/(erp)/projetos/page.tsx`
- **Linha**: 27
- **TODO**: `// TODO: Implementar drawer de edição`
- **Descrição**: Drawer para editar projeto não implementado
- **Ação**: Criar componente de drawer com formulário de edição

- **Arquivo**: `src/app/(erp)/projetos/page.tsx`
- **Linha**: 28
- **TODO**: `// TODO: Implementar Kanban (projetos têm status)`
- **Descrição**: Visualização Kanban para projetos não implementada
- **Ação**: Implementar componente Kanban com drag & drop

### Schema Prisma
- **Arquivo**: `prisma/schema.prisma`
- **Linha**: 455
- **TODO**: `// TODO: Habilitar quando pgvector estiver ativo`
- **Descrição**: Modelo DocumentoEmbedding comentado
- **Ação**: Habilitar pgvector no Supabase e descomentar modelo

- **Arquivo**: `prisma/schema.prisma`
- **Linha**: 481
- **TODO**: `// TODO: Habilitar quando pgvector estiver ativo`
- **Descrição**: Relacionamento embeddings comentado
- **Ação**: Habilitar pgvector no Supabase e descomentar relacionamento

## 📊 Resumo

### Por Prioridade
1. **Alta Prioridade** (Bloqueia funcionalidade):
   - Implementar autenticação JWT (5 ocorrências)
   - Implementar busca de dados via API (2 ocorrências)
   - Implementar modais/drawers de CRUD (4 ocorrências)

2. **Média Prioridade** (Melhora UX):
   - Implementar Kanban drag&drop (1 ocorrência)

3. **Baixa Prioridade** (Funcionalidade futura):
   - Habilitar pgvector para embeddings (2 ocorrências)

### Por Categoria
- **Autenticação**: 5 TODOs
- **UI/UX**: 7 TODOs
- **Banco de Dados**: 2 TODOs
- **Total**: 14 TODOs

## 🎯 Plano de Resolução

### Fase 1 - Autenticação (Semana 1)
1. Implementar sistema de autenticação JWT
2. Criar middleware de autenticação
3. Atualizar todas as APIs para usar usuário autenticado

### Fase 2 - CRUD UI (Semana 2-3)
1. Implementar hooks de busca de dados
2. Criar modais de criação
3. Criar drawers de edição
4. Implementar validação de formulários

### Fase 3 - Kanban (Semana 4)
1. Implementar componente Kanban
2. Adicionar drag & drop
3. Integrar com API de atualização de status

### Fase 4 - Embeddings (Futuro)
1. Habilitar pgvector no Supabase
2. Descomentar modelos de embedding
3. Implementar busca semântica

## 📝 Notas

- Todos os TODOs estão marcados com `// TODO(docs:<arquivo#linha>)` para facilitar localização
- Priorizar implementação de autenticação antes de outras funcionalidades
- Manter consistência com padrões V1C definidos
- Testar todas as implementações com `npm run check:all`
