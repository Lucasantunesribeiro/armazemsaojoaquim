const fetch = require('node-fetch')

async function testSMTPSystem() {
  console.log('🧪 TESTE FINAL - Sistema Inteligente SMTP')
  console.log('==========================================\n')

  const baseUrl = 'https://armazemsaojoaquim.netlify.app'

  try {
    console.log('1. 🔍 Verificando status SMTP...')
    
    const statusResponse = await fetch(`${baseUrl}/api/auth/check-smtp-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status}`)
    }

    const status = await statusResponse.json()
    
    console.log('📊 Status SMTP:', {
      smtpConfigured: status.smtpConfigured,
      publicSignupWorking: status.publicSignupWorking,
      recommendedStrategy: status.recommendedStrategy,
      timestamp: status.timestamp
    })

    console.log('\n2. 🧪 Testando signup inteligente...')
    
    const testEmail = `test-smtp-${Date.now()}@example.com`
    console.log(`   Testando com: ${testEmail}`)

    const signupResponse = await fetch(`${baseUrl}/api/auth/check-smtp-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        name: 'Test User SMTP'
      })
    })

    if (!signupResponse.ok) {
      const errorData = await signupResponse.json()
      console.log('   ❌ Erro no signup:', errorData.error)
      return
    }

    const signupResult = await signupResponse.json()
    
    console.log('✅ Resultado do signup:')
    console.log('   Success:', signupResult.success)
    console.log('   Strategy:', signupResult.strategy)
    console.log('   Message:', signupResult.message)
    console.log('   Requires Email Verification:', signupResult.requiresEmailVerification)
    
    if (signupResult.warning) {
      console.log('   Warning:', signupResult.warning)
    }

    console.log('\n📋 INTERPRETAÇÃO DOS RESULTADOS:')
    console.log('=====================================')
    
    if (signupResult.strategy === 'public_with_verification') {
      console.log('🎉 PERFEITO! SMTP está configurado e funcionando!')
      console.log('   ✅ Verificação por email está ATIVA')
      console.log('   ✅ Usuários receberão emails de confirmação')
      console.log('   ✅ Sistema funcionando como esperado')
    } else if (signupResult.strategy === 'admin_auto_confirm') {
      console.log('⚠️ SMTP não configurado - usando fallback')
      console.log('   ❌ Verificação por email está DESATIVADA')
      console.log('   ✅ Contas são criadas e confirmadas automaticamente')
      console.log('   📧 Configure SMTP para ativar verificação por email')
    }

    console.log('\n🛠️ PRÓXIMOS PASSOS:')
    console.log('=====================================')
    
    if (signupResult.strategy !== 'public_with_verification') {
      console.log('Para ativar verificação por email:')
      console.log('1. Acesse: https://supabase.com/dashboard/project/enolssforaepnrpfrima/auth/settings')
      console.log('2. Configure SMTP Settings ou deixe desabilitado (usar padrão Supabase)')
      console.log('3. Verifique Site URL e Redirect URLs')
      console.log('4. Aguarde 5-10 minutos após salvar')
      console.log('5. Teste novamente')
      console.log('')
      console.log('📖 Guia completo: docs/CONFIGURACAO_SMTP_SUPABASE.md')
    } else {
      console.log('🎯 Sistema perfeito! Verificação por email funcionando.')
      console.log('📧 Usuários receberão emails de confirmação.')
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    console.log('\n🔧 SOLUÇÃO:')
    console.log('1. Verifique se o site está online')
    console.log('2. Aguarde alguns minutos após deploy')
    console.log('3. Tente novamente')
  }
}

console.log('Aguardando 30 segundos para garantir que o deploy foi concluído...')
setTimeout(() => {
  testSMTPSystem().catch(console.error)
}, 30000) 