# PowerShell script para configurar secrets no GitHub
# Execute este script após obter o token do Vercel

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelToken
)

# Informações do projeto
$OrgId = "gabriels-projects-57d2e460"
$ProjectId = "prj_qy5xOGuhw7NvF0NG9WiF8ZncQGJ4"
$Repo = "adm-toolsmm-ia/erp-interno-tech"

Write-Host "🔐 Configurando secrets no GitHub..." -ForegroundColor Green

# Verificar se GitHub CLI está instalado
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI não está instalado. Instalando..." -ForegroundColor Red
    
    # Instalar GitHub CLI via winget
    winget install --id GitHub.cli
    
    Write-Host "✅ GitHub CLI instalado. Execute 'gh auth login' e rode este script novamente." -ForegroundColor Yellow
    exit 1
}

# Verificar se está autenticado
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Não está autenticado no GitHub CLI." -ForegroundColor Red
    Write-Host "Execute: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI autenticado" -ForegroundColor Green

# Configurar secrets
Write-Host "📝 Configurando VERCEL_TOKEN..." -ForegroundColor Cyan
gh secret set VERCEL_TOKEN --body $VercelToken --repo $Repo

Write-Host "📝 Configurando VERCEL_ORG_ID..." -ForegroundColor Cyan
gh secret set VERCEL_ORG_ID --body $OrgId --repo $Repo

Write-Host "📝 Configurando VERCEL_PROJECT_ID..." -ForegroundColor Cyan
gh secret set VERCEL_PROJECT_ID --body $ProjectId --repo $Repo

Write-Host "✅ Secrets configurados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure as variáveis de ambiente no Vercel Dashboard" -ForegroundColor White
Write-Host "2. Faça um push para a branch develop para testar o pipeline" -ForegroundColor White
Write-Host "3. Verifique o deploy preview em: https://vercel.com/gabriels-projects-57d2e460/erp-interno-tech" -ForegroundColor White
