const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 DIAGNÓSTICO SUPABASE AUTH')
console.log('================================')
console.log('URL:', supabaseUrl)
console.log('Key (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log('\n🔄 Testando conexão com Supabase...')
    
    // Teste 1: Verificar se o Supabase está acessível
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Erro ao conectar:', error.message)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida')
    
    // Teste 2: Verificar configurações de auth
    console.log('\n🔄 Testando configurações de autenticação...')
    
    // Tentar fazer signup com email de teste
    const testEmail = 'teste-diagnostico@example.com'
    const testPassword = 'senha123456'
    
    console.log(`📧 Tentando registrar usuário de teste: ${testEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Teste Diagnóstico',
          name: 'Teste Diagnóstico'
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ Erro no signup:', signUpError.message)
      console.error('Código do erro:', signUpError.status)
      console.error('Detalhes:', signUpError)
      
      // Verificar tipos específicos de erro
      if (signUpError.message?.includes('signup is disabled')) {
        console.log('\n💡 SOLUÇÃO: O signup está desabilitado no Supabase')
        console.log('   1. Acesse o painel do Supabase')
        console.log('   2. Vá em Authentication > Settings')
        console.log('   3. Habilite "Enable email confirmations"')
        console.log('   4. Habilite "Enable sign ups"')
      }
      
      if (signUpError.message?.includes('Invalid email')) {
        console.log('\n💡 SOLUÇÃO: Email inválido ou domínio não permitido')
      }
      
      if (signUpError.status === 500) {
        console.log('\n💡 POSSÍVEL CAUSA: Erro interno do Supabase')
        console.log('   - Verifique se o projeto está ativo')
        console.log('   - Verifique se as chaves estão corretas')
        console.log('   - Verifique se há limites de quota excedidos')
      }
      
      return false
    }
    
    console.log('✅ Signup funcionando corretamente')
    console.log('Usuário criado:', signUpData.user?.email)
    console.log('Confirmação necessária:', !signUpData.user?.email_confirmed_at)
    
    // Teste 3: Verificar se consegue fazer login
    console.log('\n🔄 Testando login...')
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) {
      if (signInError.message?.includes('Email not confirmed')) {
        console.log('⚠️  Email não confirmado (esperado para novos usuários)')
      } else {
        console.error('❌ Erro no login:', signInError.message)
      }
    } else {
      console.log('✅ Login funcionando')
    }
    
    // Limpeza: tentar deletar o usuário de teste
    if (signUpData.user) {
      console.log('\n🧹 Limpando usuário de teste...')
      await supabase.auth.signOut()
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function checkSupabaseSettings() {
  console.log('\n🔄 Verificando configurações do projeto...')
  
  try {
    // Tentar acessar uma tabela pública para verificar se o projeto está ativo
    const { data, error } = await supabase
      .from('reservas')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao acessar banco de dados:', error.message)
      
      if (error.message?.includes('relation "public.reservas" does not exist')) {
        console.log('💡 Tabela "reservas" não existe - execute as migrações')
      }
      
      if (error.message?.includes('JWT')) {
        console.log('💡 Problema com autenticação JWT - verifique as chaves')
      }
      
      return false
    }
    
    console.log('✅ Banco de dados acessível')
    return true
    
  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error)
    return false
  }
}

async function main() {
  const connectionOk = await testSupabaseConnection()
  const settingsOk = await checkSupabaseSettings()
  
  console.log('\n📊 RESUMO DO DIAGNÓSTICO')
  console.log('========================')
  console.log('Conexão Supabase:', connectionOk ? '✅ OK' : '❌ ERRO')
  console.log('Configurações:', settingsOk ? '✅ OK' : '❌ ERRO')
  
  if (!connectionOk || !settingsOk) {
    console.log('\n🔧 PRÓXIMOS PASSOS:')
    console.log('1. Verifique o painel do Supabase em https://supabase.com/dashboard')
    console.log('2. Confirme que o projeto está ativo e não pausado')
    console.log('3. Verifique as configurações de Authentication')
    console.log('4. Confirme que as variáveis de ambiente estão corretas')
    
    process.exit(1)
  }
  
  console.log('\n🎉 Supabase configurado corretamente!')
}

main().catch(console.error) 