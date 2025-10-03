#!/bin/bash

# 🔧 ERP Git Automation Setup
# Script para configurar automação de Git e evitar Vim

echo "🚀 Configurando automação de Git para ERP Interno Tech..."

# 1. Configurar editor do Git para VS Code/Cursor
echo "📝 Configurando editor do Git..."
git config --global core.editor "code --wait"

# 2. Criar aliases úteis
echo "⚡ Criando aliases do Git..."
git config --global alias.cm "commit -m"
git config --global alias.cam "commit -am"
git config --global alias.st "status"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
git config --global alias.visual "!gitk"

# 3. Configurar hook de commit (opcional)
echo "🪝 Configurando hook de commit..."
mkdir -p .git/hooks

cat > .git/hooks/prepare-commit-msg << 'EOF'
#!/bin/sh
if [ -z "$2" ]; then
  echo "❌ Use sempre: git commit -m \"sua mensagem\""
  echo "💡 Exemplo: git commit -m \"feat(ERP/UX): add Kanban view\""
  echo "📋 Templates disponíveis em .cursor/rules/erp-commit-templates.mdc"
  exit 1
fi
EOF

# Dar permissão de execução ao hook
chmod +x .git/hooks/prepare-commit-msg

# 4. Configurar mensagem de commit padrão
echo "📋 Configurando mensagem de commit padrão..."
git config --global commit.template .gitmessage

# Criar template de commit
cat > .gitmessage << 'EOF'
# <tipo>(ERP/<escopo>): <descrição>
#
# <corpo opcional explicando o que e por que>
#
# <footer opcional com breaking changes ou issues>
#
# Tipos: feat, fix, docs, chore, refactor, style, test
# Escopos: UX, API, DB, AUTH, TENANT, DOCS, CONFIG
#
# Exemplos:
# feat(ERP/UX): add Kanban view to Projetos
# fix(ERP/API): correct Prisma validation
# docs(ERP/DOCS): create UX/UI guidelines
EOF

# 5. Configurar push padrão
echo "📤 Configurando push padrão..."
git config --global push.default current
git config --global push.autoSetupRemote true

# 6. Configurar pull padrão
echo "📥 Configurando pull padrão..."
git config --global pull.rebase false

# 7. Configurar cores
echo "🎨 Configurando cores do Git..."
git config --global color.ui auto
git config --global color.branch auto
git config --global color.diff auto
git config --global color.status auto

# 8. Configurar merge
echo "🔀 Configurando merge..."
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

echo "✅ Configuração concluída!"
echo ""
echo "📋 Comandos úteis:"
echo "  git cm \"mensagem\"     # commit rápido"
echo "  git cam \"mensagem\"    # add + commit"
echo "  git st                 # status"
echo "  git last               # último commit"
echo ""
echo "📚 Templates de commit em .cursor/rules/erp-commit-templates.mdc"
echo "🔧 Configurações salvas em ~/.gitconfig"
echo ""
echo "🎯 Próximo passo: git commit -m \"chore(ERP/CONFIG): setup Git automation\""
