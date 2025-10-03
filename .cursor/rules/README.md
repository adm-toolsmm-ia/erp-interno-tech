# 📋 Regras do Cursor - ERP Interno Tech

## Visão Geral

Este diretório contém as regras específicas do Cursor para o projeto ERP Interno Tech, organizadas por contexto e aplicabilidade.

## Regras Criadas

### 1. **erp-context-engineering.mdc** (Always Apply)
- **Aplicação**: Sempre ativa
- **Propósito**: Regras fundamentais de Context Engineering para IA
- **Conteúdo**: Audit fields, multi-tenancy, JSON autodocumentado, seeds versionados, fluxos Mermaid
- **Foco**: Estruturação de contexto para agentes IA

### 2. **erp-prompts-library.mdc** (TypeScript/JavaScript)
- **Aplicação**: Arquivos .ts, .tsx, .js, .jsx
- **Propósito**: Biblioteca de prompts modulares para desenvolvimento
- **Conteúdo**: Prompts CRUD, validação, testes, domínios específicos, segurança, integração
- **Foco**: Padronização de prompts para eficiência de desenvolvimento

### 3. **erp-agents-personas.mdc** (Manual)
- **Aplicação**: Manual (fetch_rules)
- **Propósito**: Definição de personas de agentes IA
- **Conteúdo**: Agente Auditor, Gerente Virtual, Atendimento, Documentação, Financeiro, Busca
- **Foco**: Especificação de responsabilidades e escopo de agentes

### 4. **erp-domain-context.mdc** (TypeScript/JavaScript)
- **Aplicação**: Arquivos .ts, .tsx, .js, .jsx
- **Propósito**: Contexto específico do domínio de Projetos
- **Conteúdo**: Modelo de dados, regras de negócio, APIs, fluxos, relacionamentos
- **Foco**: Contexto detalhado para desenvolvimento no domínio

### 5. **erp-multi-tenant.mdc** (Always Apply)
- **Aplicação**: Sempre ativa
- **Propósito**: Regras rigorosas de multi-tenancy
- **Conteúdo**: Isolamento, validação, filtros, segurança, performance, integração
- **Foco**: Garantia de isolamento de dados entre empresas

### 6. **erp-observability.mdc** (Manual)
- **Aplicação**: Manual (fetch_rules)
- **Propósito**: Observabilidade e monitoramento
- **Conteúdo**: Logs estruturados, métricas, tracing, health checks, alertas
- **Foco**: Monitoramento completo do sistema e agentes IA

### 7. **erp-workflow.mdc** (Always Apply)
- **Aplicação**: Sempre ativa
- **Propósito**: Fluxo de trabalho padronizado
- **Conteúdo**: PRD → Arquitetura → Implementação → Testes → Validação
- **Foco**: Processo de desenvolvimento estruturado

## Como Usar

### Regras Always Apply
- **erp-context-engineering.mdc**: Ativa automaticamente em todas as interações
- **erp-multi-tenant.mdc**: Ativa automaticamente para garantir multi-tenancy
- **erp-workflow.mdc**: Ativa automaticamente para seguir processo de desenvolvimento

### Regras por Tipo de Arquivo
- **erp-prompts-library.mdc**: Ativa em arquivos TypeScript/JavaScript
- **erp-domain-context.mdc**: Ativa em arquivos TypeScript/JavaScript

### Regras Manuais
- **erp-agents-personas.mdc**: Use `fetch_rules` para acessar
- **erp-observability.mdc**: Use `fetch_rules` para acessar

## Integração com Documentação

### Documentos de Referência
- `docs/01-project-rules.md`: Regras fundamentais do projeto
- `docs/02-prompts.md`: Biblioteca de prompts
- `docs/03-domains/projeto.md`: Contexto do domínio de projetos
- `docs/04-agentes.md`: Personas de agentes IA

### Sincronização
- As regras do Cursor são extraídas da documentação existente
- Mantenha consistência entre regras e documentação
- Atualize regras quando documentação for modificada

## Manutenção

### Atualizações
- Atualize regras quando houver mudanças na documentação
- Teste regras com prompts reais
- Colete feedback da equipe sobre eficácia

### Versionamento
- Regras são versionadas junto com o código
- Changelog de mudanças em regras
- Testes de regras em CI/CD

## Benefícios

### Para Desenvolvedores
- **Prompts padronizados**: Não precisam "inventar" prompts
- **Contexto automático**: Regras aplicadas automaticamente
- **Consistência**: Padrões seguidos automaticamente
- **Eficiência**: Desenvolvimento mais rápido e consistente

### Para Agentes IA
- **Contexto estruturado**: Informações organizadas e acessíveis
- **Personas definidas**: Escopo e responsabilidades claras
- **Multi-tenancy**: Isolamento garantido
- **Observabilidade**: Monitoramento completo

### Para o Projeto
- **Qualidade**: Padrões aplicados automaticamente
- **Escalabilidade**: Estrutura preparada para crescimento
- **Manutenibilidade**: Código consistente e documentado
- **Segurança**: Regras de segurança aplicadas automaticamente
