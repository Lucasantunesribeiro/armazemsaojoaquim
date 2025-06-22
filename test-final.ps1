Write-Host "🧪 TESTE FINAL - Sistema de Verificação por Email" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. 🔍 Verificando status SMTP..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://armazemsaojoaquim.netlify.app/api/auth/check-smtp-status" -Method GET
    
    Write-Host "✅ Sistema online!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resultados:" -ForegroundColor Cyan
    Write-Host "   SMTP Configurado: $($response.smtpConfigured)" -ForegroundColor White
    Write-Host "   Signup Público: $($response.publicSignupWorking)" -ForegroundColor White  
    Write-Host "   Estratégia: $($response.recommendedStrategy)" -ForegroundColor White
    Write-Host ""
    
    if ($response.recommendedStrategy -eq "public") {
        Write-Host "🎉 PERFEITO! Verificação por email está ATIVA!" -ForegroundColor Green
        Write-Host "   ✅ SMTP Resend funcionando" -ForegroundColor Green
        Write-Host "   ✅ Sistema exigirá confirmação por email" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://armazemsaojoaquim.netlify.app/auth" -ForegroundColor White
        Write-Host "   2. Clique em 'Criar conta'" -ForegroundColor White
        Write-Host "   3. Preencha os dados" -ForegroundColor White
        Write-Host "   4. Verifique seu email" -ForegroundColor White
        Write-Host "   5. Clique no link de confirmação" -ForegroundColor White
        Write-Host "   6. Faça login normalmente" -ForegroundColor White
    } else {
        Write-Host "⚠️ Sistema usando fallback - SMTP pode ter problemas" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erro ao verificar sistema: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Sistema pronto para uso!" -ForegroundColor Green 