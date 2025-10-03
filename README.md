# 🏢 ERP Interno Tech

ERP interno da empresa Tech em fase de MVP, desenvolvido com Next.js 15, Prisma, Supabase e Tailwind CSS.

## 🚀 Funcionalidades Atuais

- **Multi-tenancy** rigorosa com isolamento de dados
- **Soft delete** universal em todos os modelos
- **CRUDs** para empresas, clientes, projetos, documentos e orçamentos
- **Dashboards** essenciais com métricas de negócio
- **Documentos** versionados com busca semântica
- **Orçamentos** com workflow de aprovação
- **Observabilidade** mínima com health checks

## 🛠️ Tecnologias

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Storage + Edge Functions)
- **ORM**: Prisma com multi-tenancy
- **Deploy**: Vercel (Prod, Preview, Dev)
- **IA**: Embeddings com pgvector (Fase 2)

## 📚 Documentação

### Contexto e Arquitetura
- [📄 Contexto Completo](docs/00-contexto.md) - PRD, schema, fluxos
- [📋 Módulos](docs/01-modulos.md) - Detalhes por módulo
- [🔒 Segurança](docs/02-seguranca.md) - Estratégia de auth/RBAC
- [📊 Observabilidade](docs/03-observabilidade.md) - Logs, métricas, tracing
- [🚀 Roadmap](docs/04-roadmap.md) - Evolução técnica

### Regras do Cursor
- [🎯 Índice Consolidado](.cursor/rules/_index.mdc) - Regras práticas
- [💻 Desenvolvimento](.cursor/rules/development.mdc) - Commits, branches, testes
- [🏗️ Arquitetura](.cursor/rules/architecture.mdc) - Multi-tenancy, padrões
- [🗄️ Database](.cursor/rules/database.mdc) - Prisma, seeds, migrations
- [🔒 Segurança](.cursor/rules/security.mdc) - Validações, auditoria
- [🚀 CI/CD](.cursor/rules/ci-cd.mdc) - Pipelines, deploy, monitoramento

## ⚡ Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/adm-toolsmm-ia/erp-interno-tech.git
cd erp-interno-tech

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Execute as migrations
npx prisma migrate dev

# 5. Execute o projeto
npm run dev
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── health/        # Health checks
│   │   ├── empresas/      # CRUD empresas
│   │   ├── clientes/      # CRUD clientes
│   │   ├── projetos/      # CRUD projetos
│   │   ├── documentos/    # CRUD documentos
│   │   └── orcamentos/    # CRUD orçamentos
│   └── (dashboard)/       # Páginas do dashboard
├── components/            # Componentes React
│   ├── ui/               # Shadcn/UI components
│   ├── forms/            # Formulários específicos
│   ├── tables/           # Tabelas e listas
│   ├── modals/           # Modais de criação
│   ├── drawers/          # Drawers de edição
│   └── dashboards/       # Visões 360º
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   ├── supabase.ts       # Cliente Supabase
│   └── utils.ts          # Utilitários gerais
├── hooks/                # Hooks customizados
│   ├── use-tenant.ts     # Hook de multi-tenancy
│   └── use-crud.ts       # Hook de CRUD
└── types/                # Tipos TypeScript
    ├── api.ts            # Tipos de API
    └── database.ts       # Tipos de banco
```

## 🎯 Princípios Fundamentais

### 1. Multi-Tenancy Rigorosa
- **TODAS** as operações incluem `empresaId`
- **TODAS** as queries filtram por tenant
- **NUNCA** expor dados de outras empresas

### 2. Soft Delete Universal
- **TODOS** os modelos têm `deletedAt`
- **TODAS** as queries filtram `deletedAt: null`
- **NUNCA** deletar dados permanentemente

### 3. Observabilidade Mínima
- Endpoint `/api/health` obrigatório
- Logs estruturados em console
- Métricas básicas de performance

### 4. Testes Obrigatórios
- Testes unitários para CRUDs
- Testes de multi-tenancy
- Testes de soft delete
- Testes de validações

## 🚀 Deploy

### Ambientes
- **Desenvolvimento**: Deploy automático em `develop`
- **Preview/Homologação**: Deploy automático em PRs
- **Produção**: Deploy controlado em `main`

### Comandos
```bash
# Deploy para preview
npm run deploy:preview

# Deploy para produção
npm run deploy:production
```

## 📊 Status do Projeto

### ✅ Concluído
- [x] Arquitetura base definida
- [x] Regras do Cursor implementadas
- [x] Padrões de commit automatizados
- [x] Documentação completa
- [x] Estrutura de pastas organizada

### 🚧 Em Desenvolvimento
- [ ] Schema Prisma completo
- [ ] APIs de todos os módulos
- [ ] UI/UX consistente
- [ ] Testes unitários
- [ ] Deploy automático

### 📋 Próximos Passos
- [ ] Implementar CRUDs básicos
- [ ] Configurar multi-tenancy
- [ ] Implementar soft delete
- [ ] Criar dashboards essenciais
- [ ] Configurar observabilidade

## 🤝 Contribuição

1. Siga os [padrões de commit](.cursor/rules/development.mdc)
2. Use as [regras do Cursor](.cursor/rules/_index.mdc)
3. Implemente [testes unitários](.cursor/rules/development.mdc)
4. Mantenha [multi-tenancy](.cursor/rules/architecture.mdc)
5. Aplique [soft delete](.cursor/rules/architecture.mdc)

## 📞 Suporte

Para dúvidas ou suporte, consulte a [documentação completa](docs/00-contexto.md) ou entre em contato com a equipe de desenvolvimento.