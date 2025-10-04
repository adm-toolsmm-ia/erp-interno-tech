# ERP Interno Tech

Sistema ERP multi-tenant desenvolvido com Next.js 15, Prisma, Supabase e TypeScript, seguindo padrões **V1C (V1 Completa)**.

## 🚀 Funcionalidades Atuais

- ✅ **Layout moderno** com Sidebar colapsável e Topbar
- ✅ **Multi-tenancy** rigoroso com isolamento por `empresaId`
- ✅ **APIs REST** completas para todas as entidades
- ✅ **Validação Zod** em todos os formulários
- ✅ **Soft Delete** universal com auditoria
- ✅ **Logs estruturados** com contexto de tenant
- ✅ **Health Check** com verificação de banco
- ✅ **Middleware de segurança** com headers obrigatórios
- ✅ **Guardrails de qualidade** (lint, validação de rotas, onClick)

## 📦 Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd erp-interno-tech

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Execute migrações
npx prisma migrate dev

# Execute seeds (opcional)
npm run db:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Configurações de Ambiente

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_anon_key"
INTERNAL_API_KEY="your_internal_api_key"
ALLOWED_ORIGINS="http://localhost:3000"
NODE_ENV="development"
```

## 📖 Como Usar

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Servidor de produção

# Qualidade de Código
npm run type-check       # Verificação de tipos TypeScript
npm run lint             # ESLint
npm run lint:fix         # Corrigir problemas de lint
npm run format           # Prettier
npm run format:check     # Verificar formatação

# Testes
npm run test             # Executar testes
npm run test:ci          # Testes para CI
npm run test:coverage    # Testes com cobertura

# Validações V1C
npm run validate:routes  # Verificar se todas as rotas documentadas existem
npm run check:onclick    # Verificar onClick vazios
npm run check:all        # Todas as validações V1C

# Auditoria
npm run audit            # Auditoria de dependências
npm run audit:fix        # Corrigir vulnerabilidades
npm run audit:ci         # Auditoria para CI

# Banco de Dados
npm run db:seed          # Executar seeds
```

### Estrutura do Projeto

```
src/
├── app/
│   ├── (erp)/           # Rotas do ERP com layout
│   │   ├── clientes/    # Módulo de clientes
│   │   ├── projetos/    # Módulo de projetos
│   │   └── dashboard/   # Dashboard principal
│   └── api/             # APIs REST
│       ├── clientes/    # API de clientes
│       ├── projetos/    # API de projetos
│       └── health/      # Health check
├── components/
│   ├── layout/          # Componentes de layout
│   └── ui/              # Componentes UI reutilizáveis
├── lib/                 # Utilitários e configurações
└── config/              # Configurações (navegação, rotas)
```

## 🎯 Exemplos de Uso

### Criando um Cliente

```typescript
// API Call
const response = await fetch('/api/clientes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-key': process.env.INTERNAL_API_KEY,
    'x-tenant-id': empresaId,
  },
  body: JSON.stringify({
    razaoSocial: 'Empresa Exemplo LTDA',
    cnpj: '12345678000195',
    logradouro: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234567',
  }),
});
```

### Buscando Projetos com Filtros

```typescript
const response = await fetch('/api/projetos?search=desenvolvimento&prioridade=ALTA&page=1&limit=20', {
  headers: {
    'x-internal-key': process.env.INTERNAL_API_KEY,
    'x-tenant-id': empresaId,
  },
});
```

## 🔗 Dependências Principais

- **Next.js 15** - Framework React com App Router
- **Prisma** - ORM e migrações de banco
- **Supabase** - Banco PostgreSQL e autenticação
- **TypeScript** - Tipagem estática
- **Zod** - Validação de schemas
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Radix UI** - Componentes acessíveis

## 📚 Documentação Adicional

### Regras e Padrões
- [Regras V1C](.cursor/rules/erp-frontend-v1c.mdc) - Critérios de aceitação obrigatórios
- [UX/UI Guidelines](.cursor/rules/erp-ux-consolidated.mdc) - Padrões de interface
- [Padrões de Commit](.cursor/rules/erp-commit-standards.mdc) - Convenções de commit
- [Multi-tenancy](.cursor/rules/erp-multi-tenant.mdc) - Regras de isolamento

### Documentação de Negócio
- [Contexto Completo](docs/00-contexto.md) - PRD, schema, fluxos
- [Módulos](docs/01-modulos.md) - Detalhes por módulo
- [Segurança](docs/02-seguranca.md) - Estratégia de auth/RBAC
- [Observabilidade](docs/03-observabilidade.md) - Logs, métricas, tracing

### Validações V1C

O projeto segue rigorosamente os **Critérios de Aceitação Globais (CAG)**:

- ✅ **Todas as páginas documentadas** existem e funcionam
- ✅ **Botões primários** abrem modal/navegam + validam + persistem + toast
- ✅ **Kanban apenas** onde schema tem status/etapas
- ✅ **Multi-tenancy** funcionando em todas as operações
- ✅ **Soft delete** aplicado consistentemente
- ✅ **Logs estruturados** com tenantId
- ✅ **Zero onClick vazios** no código
- ✅ **Validação Zod** em todos os forms
- ✅ **Health check** respondendo
- ✅ **Middleware** bloqueando requests inválidos

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Deploy automático via GitHub
git push origin main

# Deploy manual
npm run build
vercel --prod
```

### Variáveis de Ambiente (Produção)

Configure no painel da Vercel:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `INTERNAL_API_KEY`
- `ALLOWED_ORIGINS`

## 🛠️ Desenvolvimento

### Workflow V1C

1. **Sempre implementar** uma funcionalidade por vez
2. **Seguir** arquitetura e padrões validados
3. **Incluir** testes unitários e de integração
4. **Garantir** SRP (Single Responsibility Principle)
5. **Validar** com `npm run check:all`

### Branch Protection

- **Revisão obrigatória** antes do merge
- **Status checks** devem passar
- **Conformidade V1C** validada
- **Commits** seguem convenção obrigatória

## 📊 Monitoramento

- **Health Check**: `/api/health`
- **Logs**: Estruturados com tenantId
- **Métricas**: Por tenant
- **Error Tracking**: Com stack traces

## 🔒 Segurança

- **Multi-tenancy** rigoroso
- **Headers de segurança** obrigatórios
- **Validação** de entrada com Zod
- **Auditoria** de todas as operações
- **Soft delete** para recuperação

## 📈 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar testes E2E
- [ ] Implementar Kanban drag&drop
- [ ] Adicionar métricas avançadas
- [ ] Implementar busca semântica com IA