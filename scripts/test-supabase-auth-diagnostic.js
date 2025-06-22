const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function runDiagnostic() {
  console.log('🔍 Iniciando diagnóstico de autenticação Supabase...\n')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente não configuradas')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

  // Teste 1: Conectividade básica
  console.log('1. Testando conectividade básica...')
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.log('   ⚠️ Erro na conectividade:', error.message)
    } else {
      console.log('   ✅ Conectividade OK')
    }
  } catch (err) {
    console.log('   ❌ Falha na conectividade:', err.message)
  }

  // Teste 2: Tentativa de signup com email de teste
  console.log('\n2. Testando signup com API pública...')
  try {
    const testEmail = `test-diagnostic-${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    })
    
    if (error) {
      console.log('   ❌ Erro no signup:', error.message)
      console.log('   📋 Código do erro:', error.status || 'N/A')
      
      // Análise específica do erro
      if (error.message.includes('Error sending confirmation email')) {
        console.log('   🔍 Problema identificado: SMTP/Email')
        console.log('   💡 Possíveis causas:')
        console.log('      - Configuração SMTP incorreta')
        console.log('      - Rate limiting do provedor de email')
        console.log('      - Domínio customizado mal configurado')
      }
      
      if (error.status === 500) {
        console.log('   🔍 Problema identificado: Erro interno do servidor')
        console.log('   💡 Possíveis causas:')
        console.log('      - Constraints de banco de dados')
        console.log('      - Triggers com erro na tabela auth.users')
        console.log('      - Schema auth modificado incorretamente')
        console.log('      - Problemas de permissão no banco')
      }
    } else {
      console.log('   ✅ Signup bem-sucedido (usuário criado)')
      if (data.user && !data.user.email_confirmed_at) {
        console.log('   📧 Email de confirmação deve ter sido enviado')
      }
    }
  } catch (err) {
    console.log('   ❌ Erro inesperado no signup:', err.message)
  }

  // Teste 3: Verificar se Admin API funciona (se service key disponível)
  if (adminClient) {
    console.log('\n3. Testando Admin API...')
    try {
      const testEmail = `admin-test-${Date.now()}@example.com`
      const { data, error } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: 'AdminTest123!',
        email_confirm: true
      })
      
      if (error) {
        console.log('   ❌ Erro no Admin API:', error.message)
      } else {
        console.log('   ✅ Admin API funcionando')
        // Limpar usuário de teste
        if (data.user) {
          await adminClient.auth.admin.deleteUser(data.user.id)
          console.log('   🧹 Usuário de teste removido')
        }
      }
    } catch (err) {
      console.log('   ❌ Erro no Admin API:', err.message)
    }
  } else {
    console.log('\n3. Admin API não testada (SUPABASE_SERVICE_ROLE_KEY não encontrada)')
  }

  // Teste 4: Verificar configurações de Auth
  console.log('\n4. Verificando configurações de Auth...')
  try {
    const { data: settings } = await supabase.auth.getSession()
    console.log('   ✅ Sessão de auth acessível')
  } catch (err) {
    console.log('   ❌ Erro ao acessar configurações de auth:', err.message)
  }

  console.log('\n📋 RESUMO DO DIAGNÓSTICO:')
  console.log('=====================================')
  console.log('Com base nos erros 500 que você está vendo, as principais causas são:')
  console.log('')
  console.log('1. 🔧 PROBLEMAS DE BANCO DE DADOS:')
  console.log('   - Foreign key constraints bloqueando auth.users')
  console.log('   - Triggers customizados com erro na tabela auth.users')
  console.log('   - Schema auth modificado incorretamente')
  console.log('   - Problemas de permissão com supabase_auth_admin')
  console.log('')
  console.log('2. 📧 PROBLEMAS DE EMAIL/SMTP:')
  console.log('   - Configuração SMTP incorreta')
  console.log('   - Rate limiting do provedor')
  console.log('   - Domínio customizado mal configurado')
  console.log('')
  console.log('3. ⚡ PRÓXIMOS PASSOS RECOMENDADOS:')
  console.log('   - Verificar logs no Supabase Dashboard > Logs > Auth')
  console.log('   - Executar queries de diagnóstico SQL (ver documentação)')
  console.log('   - Verificar se há constraints ou triggers customizados')
  console.log('   - Testar com Admin API se possível')
  console.log('')
  console.log('📚 Referência: https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8')
}

// Executar diagnóstico
runDiagnostic().catch(console.error) 