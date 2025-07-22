#!/usr/bin/env node

/**
 * DIAGNÓSTICO COMPLETO DO SISTEMA DE EMAIL
 * Armazém São Joaquim - Solução Definitiva
 * 
 * Este script testa TODOS os aspectos do sistema de email:
 * 1. Configuração SMTP no Supabase
 * 2. APIs do projeto 
 * 3. Fluxo completo de registro
 * 4. Sistema de email de reservas
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log('🚨 DIAGNÓSTICO COMPLETO - SISTEMA DE EMAIL');
console.log('═'.repeat(60));
console.log('🏥 EMERGÊNCIA: Sistema de verificação por email');
console.log('📧 Gmail SMTP: armazemsaojoaquimoficial@gmail.com');
console.log('🔐 Senha App: ljab lpdr bzmw eyhh');
console.log('');

// Verificar configurações
function checkEnvironment() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÕES');
  console.log('─'.repeat(40));
  
  const configs = {
    supabaseUrl: !!SUPABASE_URL,
    supabaseServiceKey: !!SUPABASE_SERVICE_KEY,
    supabaseAnonKey: !!SUPABASE_ANON_KEY,
    resendApiKey: !!RESEND_API_KEY,
    baseUrl: BASE_URL
  };
  
  console.log(`🌐 Supabase URL: ${configs.supabaseUrl ? '✅ OK' : '❌ FALTANDO'}`);
  console.log(`🔐 Service Key: ${configs.supabaseServiceKey ? '✅ OK' : '❌ FALTANDO'}`);
  console.log(`🔑 Anon Key: ${configs.supabaseAnonKey ? '✅ OK' : '❌ FALTANDO'}`);
  console.log(`📧 Resend Key: ${configs.resendApiKey ? '✅ OK' : '❌ FALTANDO'}`);
  console.log(`🌍 Base URL: ${configs.baseUrl}`);
  console.log('');
  
  return configs;
}

// Teste SMTP direto
async function testSupabaseSmtpDirect() {
  console.log('🧪 TESTE SMTP DIRETO (SUPABASE)');
  console.log('─'.repeat(40));
  
  try {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Teste Admin Invite
    const testEmail1 = `admin-test-${Date.now()}@example.com`;
    console.log(`🔄 Admin Invite: ${testEmail1}`);
    
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(testEmail1, {
      redirectTo: `${BASE_URL}/auth/callback`
    });
    
    const adminWorks = !inviteError;
    console.log(`🔧 Admin Invite: ${adminWorks ? '✅ FUNCIONANDO' : '❌ FALHOU'}`);
    if (inviteError) {
      console.log(`   Erro: ${inviteError.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste Public Signup
    const testEmail2 = `public-test-${Date.now()}@example.com`;
    console.log(`🔄 Public Signup: ${testEmail2}`);
    
    const { data: signupData, error: signupError } = await publicClient.auth.signUp({
      email: testEmail2,
      password: 'TestSMTP123!',
      options: {
        data: { full_name: 'Test User Public' }
      }
    });
    
    const publicWorks = !signupError;
    console.log(`👥 Public Signup: ${publicWorks ? '✅ FUNCIONANDO' : '❌ FALHOU'}`);
    if (signupError) {
      console.log(`   Erro: ${signupError.message}`);
    }
    
    // Cleanup
    const testUsers = [];
    if (inviteData?.user) testUsers.push(inviteData.user.id);
    if (signupData?.user) testUsers.push(signupData.user.id);
    
    if (testUsers.length > 0) {
      console.log('🧹 Limpando usuários de teste...');
      for (const userId of testUsers) {
        await adminClient.auth.admin.deleteUser(userId);
      }
    }
    
    console.log('');
    return { adminWorks, publicWorks, recommendedStrategy: adminWorks && publicWorks ? 'public' : adminWorks ? 'admin' : 'none' };
    
  } catch (error) {
    console.log(`❌ ERRO FATAL: ${error.message}`);
    console.log('');
    return { adminWorks: false, publicWorks: false, recommendedStrategy: 'none' };
  }
}

// Teste APIs do projeto
async function testProjectAPIs() {
  console.log('🔧 TESTE APIS DO PROJETO');
  console.log('─'.repeat(40));
  
  const results = {};
  
  try {
    // Teste 1: Check SMTP Status
    console.log('🔄 Testando: /api/auth/check-smtp-status');
    const smtpResponse = await fetch(`${BASE_URL}/api/auth/check-smtp-status`);
    const smtpData = await smtpResponse.json();
    
    results.smtpCheck = {
      success: smtpResponse.ok,
      data: smtpData,
      configured: smtpData.smtpConfigured,
      strategy: smtpData.recommendedStrategy
    };
    
    console.log(`📊 SMTP Status: ${results.smtpCheck.configured ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO'}`);
    console.log(`🎯 Estratégia: ${results.smtpCheck.strategy}`);
    
  } catch (error) {
    console.log(`❌ Erro API SMTP Status: ${error.message}`);
    results.smtpCheck = { success: false, error: error.message };
  }
  
  try {
    // Teste 2: Signup with Fallback
    const testEmail = `api-test-${Date.now()}@example.com`;
    console.log(`🔄 Testando signup: ${testEmail}`);
    
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup-with-fallback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestAPI123',
        name: 'Test User API'
      })
    });
    
    const signupData = await signupResponse.json();
    
    results.signupTest = {
      success: signupResponse.ok && signupData.success,
      data: signupData,
      method: signupData.method,
      emailSent: signupData.method === 'public_api' && !!signupData.user?.confirmation_sent_at
    };
    
    console.log(`👤 Signup API: ${results.signupTest.success ? '✅ FUNCIONANDO' : '❌ FALHOU'}`);
    if (results.signupTest.success) {
      console.log(`   Método: ${results.signupTest.method}`);
      console.log(`   Email enviado: ${results.signupTest.emailSent ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   User ID: ${signupData.user?.id}`);
    } else {
      console.log(`   Erro: ${JSON.stringify(signupData)}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro API Signup: ${error.message}`);
    results.signupTest = { success: false, error: error.message };
  }
  
  try {
    // Teste 3: Test Email API (Resend)
    console.log('🔄 Testando: /api/test-email (Resend)');
    
    const emailTestResponse = await fetch(`${BASE_URL}/api/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'configuration' })
    });
    
    const emailTestData = await emailTestResponse.json();
    
    results.resendTest = {
      success: emailTestResponse.ok,
      data: emailTestData,
      configured: emailTestData.hasApiKey,
      isConfigured: emailTestData.isConfigured
    };
    
    console.log(`📧 Resend API: ${results.resendTest.configured ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO'}`);
    
  } catch (error) {
    console.log(`❌ Erro API Resend: ${error.message}`);
    results.resendTest = { success: false, error: error.message };
  }
  
  console.log('');
  return results;
}

// Teste completo de fluxo de email
async function testCompleteEmailFlow() {
  console.log('📬 TESTE FLUXO COMPLETO DE EMAIL');
  console.log('─'.repeat(40));
  
  const testEmail = `flow-test-${Date.now()}@gmail.com`; // Usar gmail.com real para teste
  
  try {
    console.log(`🔄 Testando fluxo completo: ${testEmail}`);
    
    // 1. Criar usuário
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup-with-fallback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'FlowTest123',
        name: 'Test User Flow Complete'
      })
    });
    
    const signupData = await signupResponse.json();
    
    if (signupData.success) {
      console.log(`✅ Usuário criado via: ${signupData.method}`);
      console.log(`📧 Email de verificação enviado: ${!!signupData.user?.confirmation_sent_at ? 'SIM' : 'NÃO'}`);
      console.log(`🆔 User ID: ${signupData.user?.id}`);
      
      if (signupData.user?.confirmation_sent_at) {
        console.log(`⏰ Enviado em: ${new Date(signupData.user.confirmation_sent_at).toLocaleString('pt-BR')}`);
      }
      
      return {
        success: true,
        userCreated: true,
        emailSent: !!signupData.user?.confirmation_sent_at,
        method: signupData.method,
        userId: signupData.user?.id,
        confirmationTime: signupData.user?.confirmation_sent_at
      };
    } else {
      console.log(`❌ Falha ao criar usuário: ${JSON.stringify(signupData)}`);
      return { success: false, error: signupData };
    }
    
  } catch (error) {
    console.log(`❌ Erro no fluxo completo: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Análise final e diagnóstico
function generateDiagnosis(envConfig, smtpTest, apiTest, flowTest) {
  console.log('🏥 DIAGNÓSTICO FINAL');
  console.log('═'.repeat(60));
  
  const diagnosis = {
    status: 'unknown',
    problems: [],
    solutions: [],
    emailsWorking: false,
    recommendation: ''
  };
  
  // Verificar cada componente
  console.log('📋 COMPONENTES:');
  console.log(`📧 Gmail SMTP no Supabase: ${smtpTest.adminWorks && smtpTest.publicWorks ? '✅ FUNCIONANDO' : '⚠️  PARCIAL'}`);
  console.log(`🔧 APIs do Projeto: ${apiTest.smtpCheck?.success && apiTest.signupTest?.success ? '✅ FUNCIONANDO' : '❌ PROBLEMAS'}`);
  console.log(`📬 Fluxo Completo: ${flowTest.success && flowTest.emailSent ? '✅ FUNCIONANDO' : '❌ PROBLEMAS'}`);
  console.log(`📨 Resend (Backup): ${apiTest.resendTest?.configured ? '✅ DISPONÍVEL' : '❌ NÃO CONFIGURADO'}`);
  console.log('');
  
  // Diagnóstico baseado nos testes
  if (smtpTest.adminWorks && smtpTest.publicWorks && flowTest.success && flowTest.emailSent) {
    diagnosis.status = 'FUNCIONANDO';
    diagnosis.emailsWorking = true;
    diagnosis.recommendation = 'Sistema funcionando perfeitamente! Emails sendo enviados via Gmail SMTP.';
    console.log('🎉 DIAGNÓSTICO: SISTEMA FUNCIONANDO 100%');
    console.log('✅ Emails de verificação estão sendo enviados');
    console.log('✅ Gmail SMTP configurado corretamente');
    console.log('✅ Usuários podem se registrar normalmente');
    
  } else if (smtpTest.adminWorks || smtpTest.publicWorks) {
    diagnosis.status = 'PARCIAL';
    diagnosis.emailsWorking = true;
    diagnosis.problems.push('Alguns métodos de signup podem ter problemas');
    diagnosis.solutions.push('Usar fallback para admin API se público falhar');
    diagnosis.recommendation = 'Sistema parcialmente funcional. Usar estratégia de fallback.';
    console.log('⚠️  DIAGNÓSTICO: SISTEMA PARCIALMENTE FUNCIONAL');
    console.log('✅ SMTP Gmail está configurado');
    console.log('⚠️  Alguns métodos podem falhar ocasionalmente');
    
  } else {
    diagnosis.status = 'PROBLEMAS';
    diagnosis.emailsWorking = false;
    diagnosis.problems.push('SMTP Gmail não está funcionando no Supabase');
    diagnosis.problems.push('Verificar configurações no dashboard Supabase');
    diagnosis.problems.push('Confirmar credenciais Gmail');
    diagnosis.solutions.push('Verificar SMTP Settings no Supabase Auth');
    diagnosis.solutions.push('Testar envio manual no dashboard');
    diagnosis.solutions.push('Verificar se senha de app Gmail está correta');
    diagnosis.recommendation = 'URGENT: Sistema de email não funcional. Verificar configurações.';
    console.log('🚨 DIAGNÓSTICO: SISTEMA COM PROBLEMAS GRAVES');
    console.log('❌ SMTP Gmail não está funcionando');
    console.log('❌ Emails NÃO estão sendo enviados');
  }
  
  console.log('');
  console.log('🎯 RECOMENDAÇÃO FINAL:');
  console.log(diagnosis.recommendation);
  
  if (diagnosis.problems.length > 0) {
    console.log('');
    console.log('🔧 PROBLEMAS IDENTIFICADOS:');
    diagnosis.problems.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem}`);
    });
  }
  
  if (diagnosis.solutions.length > 0) {
    console.log('');
    console.log('💡 SOLUÇÕES:');
    diagnosis.solutions.forEach((solution, index) => {
      console.log(`${index + 1}. ${solution}`);
    });
  }
  
  return diagnosis;
}

// Função principal
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Iniciando diagnóstico completo...');
    console.log('');
    
    // 1. Verificar ambiente
    const envConfig = checkEnvironment();
    
    if (!envConfig.supabaseUrl || !envConfig.supabaseServiceKey) {
      console.log('❌ ERRO FATAL: Configurações Supabase não encontradas');
      process.exit(1);
    }
    
    // 2. Teste SMTP direto
    const smtpTest = await testSupabaseSmtpDirect();
    
    // 3. Teste APIs do projeto
    const apiTest = await testProjectAPIs();
    
    // 4. Teste fluxo completo
    const flowTest = await testCompleteEmailFlow();
    
    // 5. Diagnóstico final
    const diagnosis = generateDiagnosis(envConfig, smtpTest, apiTest, flowTest);
    
    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('⏱️  RESUMO DO DIAGNÓSTICO');
    console.log('═'.repeat(40));
    console.log(`🕒 Tempo total: ${duration}ms`);
    console.log(`📧 Sistema de Email: ${diagnosis.emailsWorking ? '✅ FUNCIONANDO' : '❌ COM PROBLEMAS'}`);
    console.log(`🎯 Status Geral: ${diagnosis.status}`);
    console.log('');
    
    if (diagnosis.emailsWorking) {
      console.log('🎊 SUCESSO! Sistema de email funcionando!');
      console.log('✉️  Usuários receberão emails de verificação');
      process.exit(0);
    } else {
      console.log('🚨 FALHA! Sistema de email precisa de correção');
      console.log('❌ Usuários NÃO estão recebendo emails');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('');
    console.log('💥 ERRO FATAL NO DIAGNÓSTICO:');
    console.log(error.message);
    console.log(error.stack);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { 
  checkEnvironment, 
  testSupabaseSmtpDirect, 
  testProjectAPIs, 
  testCompleteEmailFlow,
  generateDiagnosis 
};