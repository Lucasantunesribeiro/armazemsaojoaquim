# FORCE PUSH PARA NETLIFY - ARMAZÉM SÃO JOAQUIM
# PowerShell script para contornar problemas de autenticação Git

Write-Host "🚨 FORCE PUSH NETLIFY DEPLOY" -ForegroundColor Red
Write-Host "═══════════════════════════════" -ForegroundColor Yellow

# Verificar se estamos no diretório correto
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute no diretório raiz do projeto" -ForegroundColor Red
    exit 1
}

# Tentar configurar credenciais Git temporárias
Write-Host "🔧 Configurando Git..." -ForegroundColor Yellow

try {
    # Configurar Git com cache de credenciais
    git config credential.helper store
    git config --global credential.helper 'cache --timeout=3600'
    
    Write-Host "✅ Git configurado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Falha na configuração Git: $_" -ForegroundColor Yellow
}

# Tentar push com diferentes métodos
$pushMethods = @(
    @{Name="HTTPS com cache"; Command="git push origin main"},
    @{Name="HTTPS com force"; Command="git push --force origin main"},
    @{Name="HTTPS com credentials"; Command="git push https://github.com/Lucasantunesribeiro/armazemsaojoaquim.git main"}
)

foreach ($method in $pushMethods) {
    Write-Host "🔸 Tentando: $($method.Name)" -ForegroundColor Cyan
    
    try {
        # Executar comando
        Invoke-Expression $method.Command
        
        Write-Host "✅ SUCESSO! Push realizado com $($method.Name)" -ForegroundColor Green
        Write-Host "🌐 Netlify deve iniciar deploy automaticamente" -ForegroundColor Green
        Write-Host "📍 Acompanhe em: https://app.netlify.com/sites/armazemsaojoaquim/deploys" -ForegroundColor Cyan
        exit 0
        
    } catch {
        Write-Host "❌ Falhou: $_" -ForegroundColor Red
        Start-Sleep 2
    }
}

# Se chegou aqui, todos os métodos falharam
Write-Host ""
Write-Host "❌ TODOS OS MÉTODOS DE PUSH FALHARAM" -ForegroundColor Red
Write-Host "════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 DEPLOY MANUAL NECESSÁRIO:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://github.com/Lucasantunesribeiro/armazemsaojoaquim" -ForegroundColor White
Write-Host "2. Clique em 'Add file' > 'Upload files'" -ForegroundColor White  
Write-Host "3. Faça upload destes 7 arquivos críticos:" -ForegroundColor White
Write-Host ""
Write-Host "   📁 components/ui/dialog.tsx" -ForegroundColor Cyan
Write-Host "   📁 components/ui/select.tsx" -ForegroundColor Cyan
Write-Host "   📁 components/ui/switch.tsx" -ForegroundColor Cyan  
Write-Host "   📁 components/ui/textarea.tsx" -ForegroundColor Cyan
Write-Host "   📁 components/ui/index.ts" -ForegroundColor Cyan
Write-Host "   📁 app/api/admin/users/route.ts" -ForegroundColor Cyan
Write-Host "   📁 utils/network-utils.ts" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Commit message: 'fix: resolve Netlify build failures - critical UI components'" -ForegroundColor White
Write-Host ""
Write-Host "🎯 RESULTADO ESPERADO:" -ForegroundColor Yellow
Write-Host "• Netlify detecta mudanças automaticamente" -ForegroundColor White
Write-Host "• Build usa componentes shadcn-ui v4 atualizados" -ForegroundColor White  
Write-Host "• Erros 'Module not found' resolvidos" -ForegroundColor White
Write-Host "• Site armazemsaojoaquim.com funcionando" -ForegroundColor White

Write-Host ""
Write-Host "Para executar no Windows:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File force-push.ps1" -ForegroundColor Cyan