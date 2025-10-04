# 🔐 Configuração de Secrets no GitHub

## Informações do Projeto Vercel

Com base na análise do projeto, aqui estão as informações necessárias:

### Project ID
```
prj_qy5xOGuhw7NvF0NG9WiF8ZncQGJ4
```

### Org ID
```
gabriels-projects-57d2e460
```

## Passos para Configurar Secrets

### 1. Acesse o GitHub
Vá para: https://github.com/adm-toolsmm-ia/erp-interno-tech/settings/secrets/actions

### 2. Adicione os Secrets

Clique em "New repository secret" e adicione:

#### VERCEL_TOKEN
- **Nome**: `VERCEL_TOKEN`
- **Valor**: Seu token pessoal do Vercel
- **Como obter**: 
  1. Acesse https://vercel.com/account/tokens
  2. Clique em "Create Token"
  3. Nome: "GitHub Actions - ERP"
  4. Scope: Full Account
  5. Copie o token gerado

#### VERCEL_ORG_ID
- **Nome**: `VERCEL_ORG_ID`
- **Valor**: `gabriels-projects-57d2e460`

#### VERCEL_PROJECT_ID
- **Nome**: `VERCEL_PROJECT_ID`
- **Valor**: `prj_qy5xOGuhw7NvF0NG9WiF8ZncQGJ4`

## Variáveis de Ambiente no Vercel

### 1. Acesse o Dashboard
Vá para: https://vercel.com/gabriels-projects-57d2e460/erp-interno-tech/settings/environment-variables

### 2. Adicione as Variáveis

Para **Production**, **Preview** e **Development**:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/erp_interno_tech

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
INTERNAL_API_KEY=your_internal_api_key
ALLOWED_ORIGINS=https://erp-interno-tech-gabriels-projects-57d2e460.vercel.app

# Application
NODE_ENV=production
SERVICE_VERSION=1.0.0
```

## Teste do Pipeline

Após configurar os secrets:

1. Faça um pequeno commit na branch `develop`
2. O pipeline será executado automaticamente
3. Verifique o deploy preview no Vercel

## URLs do Projeto

- **GitHub**: https://github.com/adm-toolsmm-ia/erp-interno-tech
- **Vercel Dashboard**: https://vercel.com/gabriels-projects-57d2e460/erp-interno-tech
- **Deploy Preview**: https://erp-interno-tech-gabriels-projects-57d2e460.vercel.app
