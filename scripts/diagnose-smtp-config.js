const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function diagnoseSMTPConfig() {
  console.log('📧 Diagnosticando configuração SMTP do Supabase...\n')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas')
    return
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔍 VERIFICAÇÕES NECESSÁRIAS:')
  console.log('=====================================\n')

  // 1. Verificar configurações atuais
  console.log('1. 📋 CONFIGURAÇÕES ATUAIS NO SUPABASE DASHBOARD:')
  console.log('   Acesse: https://supabase.com/dashboard/project/[seu-projeto]/auth/settings')
  console.log('   Verifique:')
  console.log('   ✓ SMTP Settings')
  console.log('   ✓ Email Templates')
  console.log('   ✓ Site URL')
  console.log('   ✓ Redirect URLs\n')

  // 2. Testar com email template simples
  console.log('2. 🧪 TESTE COM EMAIL TEMPLATE SIMPLES:')
  try {
    const testEmail = `smtp-test-${Date.now()}@gmail.com`
    console.log(`   Testando com: ${testEmail}`)
    
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(testEmail, {
      redirectTo: 'https://armazemsaojoaquim.netlify.app/auth/callback'
    })
    
    if (error) {
      console.log('   ❌ Erro no convite:', error.message)
      if (error.message.includes('Error sending confirmation email')) {
        console.log('   🔍 PROBLEMA CONFIRMADO: SMTP não configurado ou com erro')
      }
    } else {
      console.log('   ✅ Convite enviado com sucesso!')
    }
  } catch (err) {
    console.log('   ❌ Erro inesperado:', err.message)
  }

  console.log('\n3. 🛠️ SOLUÇÕES PARA PROBLEMAS SMTP:')
  console.log('=====================================')
  console.log('A. CONFIGURAR SMTP CUSTOMIZADO:')
  console.log('   • Vá para Auth > Settings > SMTP Settings')
  console.log('   • Configure com provedor como Gmail, SendGrid, ou Resend')
  console.log('   • Teste a configuração antes de salvar')
  console.log('')
  console.log('B. USAR SMTP DO SUPABASE (PADRÃO):')
  console.log('   • Desabilite SMTP customizado se estiver ativo')
  console.log('   • Verifique se o domínio está verificado')
  console.log('   • Aguarde propagação DNS (pode levar até 48h)')
  console.log('')
  console.log('C. VERIFICAR EMAIL TEMPLATES:')
  console.log('   • Auth > Email Templates')
  console.log('   • Teste templates com variáveis simples')
  console.log('   • Evite HTML complexo ou caracteres especiais')
  console.log('')
  console.log('D. CONFIGURAR SITE URL CORRETAMENTE:')
  console.log('   • Site URL: https://armazemsaojoaquim.netlify.app')
  console.log('   • Redirect URLs: https://armazemsaojoaquim.netlify.app/auth/callback')

  console.log('\n4. 🔧 CONFIGURAÇÃO RECOMENDADA:')
  console.log('=====================================')
  console.log('Para resolver rapidamente, configure SMTP com Resend:')
  console.log('')
  console.log('SMTP Host: smtp.resend.com')
  console.log('SMTP Port: 587 ou 465')
  console.log('SMTP User: resend')
  console.log('SMTP Pass: [sua-api-key-resend]')
  console.log('Sender Name: Armazém São Joaquim')
  console.log('Sender Email: armazemsaojoaquimoficial@gmail.com')
  console.log('')
  console.log('Ou use a configuração padrão do Supabase (mais simples):')
  console.log('• Deixe SMTP customizado DESABILITADO')
  console.log('• Configure apenas Site URL e Redirect URLs')

  console.log('\n5. ⚡ TESTE APÓS CONFIGURAÇÃO:')
  console.log('=====================================')
  try {
    console.log('Testando signup normal após configurar SMTP...')
    const testEmail2 = `final-test-${Date.now()}@gmail.com`
    
    // Usar cliente público para testar signup real
    const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: signupData, error: signupError } = await publicClient.auth.signUp({
      email: testEmail2,
      password: 'TestPassword123!'
    })
    
    if (signupError) {
      if (signupError.message.includes('Error sending confirmation email')) {
        console.log('   ❌ SMTP ainda não configurado - siga os passos acima')
      } else {
        console.log('   ⚠️ Outro erro:', signupError.message)
      }
    } else {
      console.log('   ✅ SMTP funcionando! Email de confirmação enviado.')
    }
  } catch (err) {
    console.log('   ❌ Erro no teste final:', err.message)
  }

  console.log('\n📚 REFERÊNCIAS:')
  console.log('• Supabase SMTP: https://supabase.com/docs/guides/auth/auth-smtp')
  console.log('• Troubleshooting: https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8')
  console.log('• Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates')
}

diagnoseSMTPConfig().catch(console.error) 