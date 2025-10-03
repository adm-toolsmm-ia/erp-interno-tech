# 📝 Guia de Commits - ERP Interno Tech

> Guia completo para padronização de commits e automação do Git

---

## 🚀 Configuração Rápida

### Windows (PowerShell)
```powershell
.\scripts\setup-git-automation.ps1
```

### Linux/Mac (Bash)
```bash
./scripts/setup-git-automation.sh
```

---

## 📋 Padrão de Commits

### Formato Obrigatório
```
<tipo>(ERP/<escopo>): <descrição>
```

### Tipos de Commit
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **chore**: Tarefas de manutenção
- **refactor**: Refatoração de código
- **style**: Formatação, sem mudança de lógica
- **test**: Testes

### Escopos do ERP
- **UX**: Interface e experiência do usuário
- **API**: Endpoints e lógica de negócio
- **DB**: Banco de dados e migrations
- **AUTH**: Autenticação e autorização
- **TENANT**: Multi-tenancy
- **DOCS**: Documentação
- **CONFIG**: Configurações e ambiente

---

## ✅ Exemplos Válidos

### Nova Funcionalidade
```bash
git commit -m "feat(ERP/UX): add Kanban view to Projetos module"
git commit -m "feat(ERP/API): add Orcamento CRUD endpoints"
git commit -m "feat(ERP/DB): add Documento versioning system"
```

### Correção de Bug
```bash
git commit -m "fix(ERP/API): correct Prisma validation for Cliente CNPJ"
git commit -m "fix(ERP/UX): correct responsive layout in Projetos list"
git commit -m "fix(ERP/DB): correct foreign key constraint in Orcamento"
```

### Documentação
```bash
git commit -m "docs(ERP/DOCS): create UX/UI guidelines documentation"
git commit -m "docs(ERP/API): update Projeto endpoints documentation"
git commit -m "docs(ERP/DB): add Prisma schema migration guide"
```

### Manutenção
```bash
git commit -m "chore(ERP/CONFIG): update ESLint configuration"
git commit -m "chore(ERP/DEPS): upgrade Prisma to latest version"
git commit -m "chore(ERP/CI): add GitHub Actions workflow"
```

---

## 🔧 Comandos Úteis

### Aliases Configurados
```bash
git cm "mensagem"     # commit rápido
git cam "mensagem"    # add + commit
git st                 # status
git last               # último commit
git visual             # abrir gitk
```

### Workflow Completo
```bash
# 1. Verificar status
git st

# 2. Adicionar arquivos
git add src/components/ProjetoKanban.tsx

# 3. Commit com mensagem padronizada
git cm "feat(ERP/UX): add Kanban view to Projetos"

# 4. Push para repositório
git push origin main
```

---

## 🎯 Templates por Módulo

### 🏢 Empresa
```bash
feat(ERP/DB): add Empresa model with multi-tenancy
fix(ERP/API): correct Empresa validation rules
docs(ERP/DOCS): create Empresa module documentation
```

### 👥 Cliente
```bash
feat(ERP/API): add Cliente CRUD endpoints
fix(ERP/DB): correct Cliente CNPJ validation
refactor(ERP/UX): optimize Cliente list performance
```

### 📋 Projeto
```bash
feat(ERP/UX): add Projeto Kanban board view
fix(ERP/API): correct Projeto status transitions
test(ERP/API): add Projeto workflow tests
```

### 📄 Documento
```bash
feat(ERP/DB): add Documento versioning system
fix(ERP/API): correct Documento upload validation
docs(ERP/DOCS): create Documento management guide
```

### 💰 Orçamento
```bash
feat(ERP/API): add Orcamento calculation logic
fix(ERP/DB): correct Orcamento decimal precision
refactor(ERP/UX): improve Orcamento form UX
```

### 📅 Cronograma
```bash
feat(ERP/UX): add Atividade timeline view
fix(ERP/API): correct Atividade dependency validation
test(ERP/API): add Atividade workflow tests
```

---

## 🚫 Evitando o Vim

### Configuração Automática
O script de configuração já resolve isso:
```bash
git config --global core.editor "code --wait"
```

### Hook de Validação
O hook `.git/hooks/prepare-commit-msg` força o uso de `-m`:
```bash
# ❌ Isso abrirá o Vim
git commit

# ✅ Isso funciona
git commit -m "feat(ERP/UX): add component"
```

---

## 🔍 Validação de Commits

### Checklist de Validação
- [ ] Prefixo correto: `feat|fix|docs|chore|refactor|style|test`
- [ ] Escopo ERP: `(ERP/[SCOPE])`
- [ ] Descrição clara e concisa
- [ ] Máximo 50 caracteres na primeira linha
- [ ] Idioma português brasileiro
- [ ] Tempo presente do indicativo

### Regex de Validação
```regex
^(feat|fix|docs|chore|refactor|style|test)\(ERP\/[A-Z]+\): .{1,50}$
```

---

## 📚 Recursos Adicionais

### Regras do Cursor
- **erp-commit-standards.mdc**: Padrões básicos
- **erp-git-automation.mdc**: Configuração e automação
- **erp-commit-templates.mdc**: Templates detalhados

### Arquivos de Configuração
- **.gitmessage**: Template de commit
- **.git/hooks/prepare-commit-msg**: Hook de validação
- **~/.gitconfig**: Configurações globais do Git

---

## 🆘 Troubleshooting

### Problema: Vim abre ao fazer commit
**Solução**: Execute o script de configuração
```powershell
.\scripts\setup-git-automation.ps1
```

### Problema: Hook não funciona
**Solução**: Verifique permissões (Linux/Mac)
```bash
chmod +x .git/hooks/prepare-commit-msg
```

### Problema: Mensagem muito longa
**Solução**: Use o padrão de 50 caracteres máximo
```bash
# ❌ Muito longo
git commit -m "feat(ERP/UX): add comprehensive Kanban board component with drag and drop functionality"

# ✅ Correto
git commit -m "feat(ERP/UX): add Kanban board with drag-drop"
```

---

## 🎯 Próximos Passos

1. **Execute o script de configuração**
2. **Teste com um commit simples**
3. **Use os templates para commits complexos**
4. **Configure o Cursor para usar as regras**

```bash
# Teste inicial
git add .
git cm "chore(ERP/CONFIG): setup Git automation and commit standards"
git push origin main
```
