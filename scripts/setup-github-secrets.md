# Configuração de Secrets do GitHub

## Secrets Obrigatórios

Configure os seguintes secrets no GitHub Actions:

### 1. VERCEL_TOKEN
- **Descrição**: Token pessoal do Vercel para deploy automático
- **Como obter**:
  1. Acesse https://vercel.com/account/tokens
  2. Clique em "Create Token"
  3. Nome: "GitHub Actions - ERP"
  4. Scope: Full Account
  5. Copie o token gerado

### 2. VERCEL_ORG_ID
- **Valor**: `gabriels-projects-57d2e460`
- **Descrição**: ID da organização no Vercel

### 3. VERCEL_PROJECT_ID
- **Valor**: `prj_qy5xOGuhw7NvF0NG9WiF8ZncQGJ4`
- **Descrição**: ID do projeto no Vercel

### 4. VERCEL_PRODUCTION_URL
- **Valor**: `https://erp-interno-tech-gabriels-projects-57d2e460.vercel.app`
- **Descrição**: URL de produção do Vercel

### 5. VERCEL_PREVIEW_URL
- **Valor**: `https://erp-interno-tech-git-develop-gabriels-projects-57d2e460.vercel.app`
- **Descrição**: URL de preview do Vercel

## Como Configurar

1. Acesse: https://github.com/adm-toolsmm-ia/erp-interno-tech/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione cada secret com o nome e valor correspondente

## Variáveis de Ambiente no Vercel

Configure as seguintes variáveis no painel do Vercel:

### Produção
- `DATABASE_URL`: Sua URL do banco de dados
- `SUPABASE_URL`: URL do seu projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
- `INTERNAL_API_KEY`: Chave interna da API
- `ALLOWED_ORIGINS`: https://erp-interno-tech-gabriels-projects-57d2e460.vercel.app
- `NODE_ENV`: production
- `SERVICE_VERSION`: 1.0.0

### Preview
- `DATABASE_URL`: Sua URL do banco de dados (pode ser a mesma)
- `SUPABASE_URL`: URL do seu projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
- `INTERNAL_API_KEY`: Chave interna da API
- `ALLOWED_ORIGINS`: *
- `NODE_ENV`: development
- `SERVICE_VERSION`: 1.0.0

## Links Úteis

- **GitHub Secrets**: https://github.com/adm-toolsmm-ia/erp-interno-tech/settings/secrets/actions
- **Vercel Dashboard**: https://vercel.com/gabriels-projects-57d2e460/erp-interno-tech
- **Vercel Environment Variables**: https://vercel.com/gabriels-projects-57d2e460/erp-interno-tech/settings/environment-variables
- **Vercel Tokens**: https://vercel.com/account/tokens
