#!/usr/bin/env node

/**
 * 📧 Script de Teste SMTP - Supabase
 * 
 * Este script testa a configuração SMTP do Supabase e diagnostica problemas comuns.
 * 
 * Como usar:
 * node scripts/test-smtp-configuration.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60))
  log(message, 'cyan')
  console.log('='.repeat(60))
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue')
}

async function testSupabaseConnection() {
  logHeader('📡 TESTE 1: Conexão com Supabase')
  
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      logError('Variáveis de ambiente não configuradas')
      logInfo('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return false
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Teste básico de conexão
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error && !error.message.includes('permission denied')) {
      logError(`Erro de conexão: ${error.message}`)
      return false
    }

    logSuccess('Conexão com Supabase estabelecida')
    logInfo(`URL: ${SUPABASE_URL}`)
    return true

  } catch (error) {
    logError(`Erro inesperado: ${error.message}`)
    return false
  }
}

async function testSignupEmail() {
  logHeader('📧 TESTE 2: Signup com Email de Teste')
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Gerar email único para teste
    const testEmail = `smtp-test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    logInfo(`Testando signup com: ${testEmail}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'SMTP Test User',
          name: 'SMTP Test User'
        }
      }
    })

    if (error) {
      if (error.message.includes('Error sending confirmation email')) {
        logError('SMTP não está configurado ou falhou')
        logWarning('Possíveis causas:')
        console.log('  • SMTP customizado não configurado no Supabase')
        console.log('  • Credenciais SMTP incorretas')
        console.log('  • Rate limit do provedor SMTP')
        console.log('  • Configuração de portas/host incorreta')
        return false
      } else if (error.status === 422) {
        logError('Email inválido ou já existe')
        return false
      } else {
        logError(`Erro no signup: ${error.message}`)
        return false
      }
    }

    if (data?.user && !data?.session) {
      logSuccess('Signup bem-sucedido - Email de confirmação deveria ser enviado')
      logInfo('Usuário criado mas precisa confirmar email')
      logInfo(`User ID: ${data.user.id}`)
      return true
    } else if (data?.session) {
      logWarning('Signup criou sessão imediatamente - Email confirmado automaticamente')
      logInfo('Isso pode indicar que SMTP não está configurado')
      return true
    } else {
      logError('Resposta inesperada do signup')
      return false
    }

  } catch (error) {
    logError(`Erro inesperado no teste de signup: ${error.message}`)
    return false
  }
}

async function testAdminInvite() {
  logHeader('🔐 TESTE 3: Convite Admin (Service Role)')
  
  try {
    if (!SUPABASE_SERVICE_KEY) {
      logWarning('SUPABASE_SERVICE_ROLE_KEY não configurada')
      logInfo('Pulando teste de convite admin')
      return null
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    const testEmail = `admin-invite-test-${Date.now()}@example.com`
    
    logInfo(`Testando convite admin para: ${testEmail}`)
    
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(testEmail, {
      redirectTo: 'https://armazemsaojoaquim.netlify.app/auth/callback'
    })

    if (error) {
      if (error.message.includes('Error sending')) {
        logError('SMTP falhou no convite admin')
        return false
      } else {
        logError(`Erro no convite admin: ${error.message}`)
        return false
      }
    }

    if (data?.user) {
      logSuccess('Convite admin enviado com sucesso')
      logInfo(`User ID: ${data.user.id}`)
      return true
    }

    return false

  } catch (error) {
    logError(`Erro inesperado no teste admin: ${error.message}`)
    return false
  }
}

async function testPasswordReset() {
  logHeader('🔑 TESTE 4: Reset de Senha')
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    const testEmail = 'armazemsaojoaquimoficial@gmail.com' // Email real do admin
    
    logInfo(`Testando reset de senha para: ${testEmail}`)
    logWarning('Este teste enviará email real se SMTP estiver configurado')
    
    // Aguardar confirmação do usuário
    console.log('\nPressione Enter para continuar ou Ctrl+C para cancelar...')
    await new Promise(resolve => {
      const stdin = process.stdin
      stdin.setRawMode(true)
      stdin.resume()
      stdin.on('data', () => {
        stdin.setRawMode(false)
        stdin.pause()
        resolve()
      })
    })

    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://armazemsaojoaquim.netlify.app/auth/reset-password'
    })

    if (error) {
      logError(`Erro no reset de senha: ${error.message}`)
      return false
    }

    logSuccess('Solicitação de reset enviada com sucesso')
    logInfo('Verifique a caixa de entrada do email')
    return true

  } catch (error) {
    logError(`Erro inesperado no teste de reset: ${error.message}`)
    return false
  }
}

function generateReport(results) {
  logHeader('📊 RELATÓRIO FINAL')
  
  console.log('Status dos Testes:')
  console.log(`Conexão Supabase: ${results.connection ? '✅' : '❌'}`)
  console.log(`Signup Email: ${results.signup ? '✅' : '❌'}`)
  console.log(`Admin Invite: ${results.adminInvite === null ? '⏭️' : results.adminInvite ? '✅' : '❌'}`)
  console.log(`Password Reset: ${results.passwordReset ? '✅' : '❌'}`)
  
  console.log('\nDiagnóstico:')
  
  if (!results.connection) {
    logError('Problema básico de conexão - Verifique configuração do Supabase')
  } else if (!results.signup) {
    logError('SMTP não está funcionando para signup')
    console.log('\nSoluções recomendadas:')
    console.log('1. Configure SMTP customizado no Dashboard Supabase')
    console.log('2. Use Resend como provedor (recomendado)')
    console.log('3. Verifique credenciais e configurações')
  } else {
    logSuccess('Sistema de email está funcionando!')
  }

  console.log('\nPróximos passos:')
  console.log('1. Acesse: https://supabase.com/dashboard/project/enolssforaepnrpfrima/auth/settings')
  console.log('2. Configure SMTP customizado')
  console.log('3. Teste signup real no site')
  console.log('4. Consulte: docs/CONFIGURACAO_SMTP_GMAIL_SUPABASE.md')
}

async function main() {
  console.clear()
  logHeader('📧 TESTE DE CONFIGURAÇÃO SMTP - SUPABASE')
  
  logInfo('Este script testará a configuração de email do Supabase')
  logInfo('Documentação: docs/CONFIGURACAO_SMTP_GMAIL_SUPABASE.md')
  
  const results = {
    connection: false,
    signup: false,
    adminInvite: null,
    passwordReset: false
  }

  // Executar testes
  results.connection = await testSupabaseConnection()
  
  if (results.connection) {
    results.signup = await testSignupEmail()
    results.adminInvite = await testAdminInvite()
    
    // Só testar reset se os outros passaram
    if (results.signup) {
      console.log('\n⚠️ O próximo teste enviará um email real de reset de senha.')
      results.passwordReset = await testPasswordReset()
    }
  }

  // Gerar relatório
  generateReport(results)
  
  console.log('\n🎯 Para configuração detalhada, consulte:')
  console.log('   docs/CONFIGURACAO_SMTP_GMAIL_SUPABASE.md')
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    logError(`Erro fatal: ${error.message}`)
    console.error(error)
    process.exit(1)
  })
}

module.exports = { testSupabaseConnection, testSignupEmail, testAdminInvite } 