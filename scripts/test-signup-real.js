const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://enolssforaepnrpfrima.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2xzc2ZvcmFlcG5ycGZyaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTQ2MzksImV4cCI6MjA2NDk5MDYzOX0.oZJdelgrqkyPA9g3cjGikrTLLNvv9sCkrTIl9jK4wBk'

async function testRealSignup() {
  console.log('🧪 TESTE SIGNUP REAL - Verificação por Email')
  console.log('============================================\n')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Email de teste único
  const testEmail = `teste-verificacao-${Date.now()}@gmail.com`
  console.log(`📧 Email de teste: ${testEmail}`)
  
  try {
    console.log('🔄 Tentando signup público (com SMTP)...')
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Teste Verificação SMTP',
          name: 'Teste Verificação SMTP'
        }
      }
    })

    console.log('\n📊 RESULTADO DO SIGNUP:')
    console.log('========================')
    
    if (error) {
      console.log('❌ ERRO:', error.message)
      console.log('   Status:', error.status)
      
      // Verificar se é erro SMTP
      if (error.message?.includes('Error sending') || error.status === 500) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO:')
        console.log('   ❌ SMTP não está funcionando corretamente')
        console.log('   ❌ Sistema ainda apresenta erro 500')
        console.log('   🔧 SOLUÇÃO: Verificar configuração SMTP no Supabase')
      }
    } else {
      console.log('✅ Signup realizado com sucesso!')
      console.log('   User ID:', data.user?.id)
      console.log('   Email:', data.user?.email)
      console.log('   Email Confirmed:', data.user?.email_confirmed_at)
      console.log('   Session:', data.session ? 'Criada' : 'Não criada')
      
      if (data.user && !data.user.email_confirmed_at) {
        console.log('\n📧 STATUS EMAIL:')
        console.log('   ✅ Conta criada via API pública')
        console.log('   📬 Email de confirmação deve ter sido enviado')
        console.log('   ⏳ Aguardando confirmação do usuário')
        console.log('\n🎯 VERIFICAR:')
        console.log('   1. Caixa de entrada do email')
        console.log('   2. Pasta de spam/lixo eletrônico')
        console.log('   3. Logs do Supabase para erros SMTP')
      } else if (data.user && data.user.email_confirmed_at) {
        console.log('\n⚠️  ATENÇÃO:')
        console.log('   🤔 Email já confirmado automaticamente')
        console.log('   🔧 Isso indica que pode estar usando Admin API')
      }
    }
    
  } catch (err) {
    console.log('❌ ERRO INESPERADO:', err.message)
  }
  
  console.log('\n🔍 PRÓXIMOS PASSOS:')
  console.log('===================')
  console.log('1. Verificar dashboard Supabase > Auth > Settings > SMTP')
  console.log('2. Confirmar que SMTP está habilitado e configurado')
  console.log('3. Testar configuração SMTP no dashboard')
  console.log('4. Verificar logs de Auth no Supabase')
}

testRealSignup().catch(console.error) 