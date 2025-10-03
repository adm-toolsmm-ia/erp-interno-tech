# 🔧 ERP Git Automation Setup (PowerShell)
# Script para configurar automação de Git e evitar Vim

Write-Host "🚀 Configurando automação de Git para ERP Interno Tech..." -ForegroundColor Green

# 1. Configurar editor do Git para VS Code/Cursor
Write-Host "📝 Configurando editor do Git..." -ForegroundColor Yellow
git config --global core.editor "code --wait"

# 2. Criar aliases úteis
Write-Host "⚡ Criando aliases do Git..." -ForegroundColor Yellow
git config --global alias.cm "commit -m"
git config --global alias.cam "commit -am"
git config --global alias.st "status"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
git config --global alias.visual "!gitk"

# 3. Configurar hook de commit (opcional)
Write-Host "🪝 Configurando hook de commit..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".git/hooks" | Out-Null

$hookContent = @'
#!/bin/sh
if [ -z "$2" ]; then
  echo "❌ Use sempre: git commit -m \"sua mensagem\""
  echo "💡 Exemplo: git commit -m \"feat(ERP/UX): add Kanban view\""
  echo "📋 Templates disponíveis em .cursor/rules/erp-commit-templates.mdc"
  exit 1
fi
'@

$hookContent | Out-File -FilePath ".git/hooks/prepare-commit-msg" -Encoding UTF8

# 4. Configurar mensagem de commit padrão
Write-Host "📋 Configurando mensagem de commit padrão..." -ForegroundColor Yellow
git config --global commit.template .gitmessage

# Criar template de commit
$templateContent = @'
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
'@

$templateContent | Out-File -FilePath ".gitmessage" -Encoding UTF8

# 5. Configurar push padrão
Write-Host "📤 Configurando push padrão..." -ForegroundColor Yellow
git config --global push.default current
git config --global push.autoSetupRemote true

# 6. Configurar pull padrão
Write-Host "📥 Configurando pull padrão..." -ForegroundColor Yellow
git config --global pull.rebase false

# 7. Configurar cores
Write-Host "🎨 Configurando cores do Git..." -ForegroundColor Yellow
git config --global color.ui auto
git config --global color.branch auto
git config --global color.diff auto
git config --global color.status auto

# 8. Configurar merge
Write-Host "🔀 Configurando merge..." -ForegroundColor Yellow
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  git cm `"mensagem`"     # commit rápido" -ForegroundColor White
Write-Host "  git cam `"mensagem`"    # add + commit" -ForegroundColor White
Write-Host "  git st                 # status" -ForegroundColor White
Write-Host "  git last               # último commit" -ForegroundColor White
Write-Host ""
Write-Host "📚 Templates de commit em .cursor/rules/erp-commit-templates.mdc" -ForegroundColor Cyan
Write-Host "🔧 Configurações salvas em ~/.gitconfig" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Próximo passo: git commit -m `"chore(ERP/CONFIG): setup Git automation`"" -ForegroundColor Yellow
