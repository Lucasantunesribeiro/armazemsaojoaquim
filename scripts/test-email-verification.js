#!/usr/bin/env node

/**
 * Script de teste para verificação de email
 * Armazém São Joaquim - Sistema de Testes
 */

const { performance } = require('perf_hooks');

// Configurações
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestEmail123!';
const TEST_NAME = 'Usuario de Teste';

console.log('🧪 INICIANDO TESTES DE EMAIL - ARMAZÉM SÃO JOAQUIM');
console.log('===============================================');
console.log(`🌐 URL Base: ${BASE_URL}`);
console.log(`📧 Email de Teste: ${TEST_EMAIL}`);
console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
console.log('');

// Utilitário para requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const startTime = performance.now();
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    console.log(`🔄 ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`✅ ${response.status} ${response.statusText} (${duration}ms)`);
    
    if (response.status >= 400) {
      console.log(`❌ Erro: ${JSON.stringify(data, null, 2)}`);
    } else if (typeof data === 'object') {
      console.log(`📦 Resposta: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`📦 Resposta: ${data}`);
    }
    
    console.log('');
    
    return {
      success: response.ok,
      status: response.status,
      data,
      duration
    };

  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.log(`❌ ERRO (${duration}ms): ${error.message}`);
    console.log('');
    
    return {
      success: false,
      error: error.message,
      duration
    };
  }
}

// Função para aguardar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Testes principais
async function runTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  console.log('🔬 EXECUTANDO TESTES...');
  console.log('');

  // Teste 1: Verificar configuração do Resend
  console.log('📋 TESTE 1: Configuração do Resend');
  console.log('─'.repeat(50));
  
  const configTest = await makeRequest('/api/test-email', {
    method: 'POST',
    body: JSON.stringify({ type: 'configuration' })
  });
  
  results.total++;
  if (configTest.success && configTest.data.hasApiKey) {
    console.log('✅ TESTE 1 PASSOU: Resend está configurado');
    results.passed++;
    results.tests.push({ name: 'Configuração Resend', status: 'PASSOU', details: configTest.data });
  } else {
    console.log('❌ TESTE 1 FALHOU: Resend não está configurado');
    results.failed++;
    results.tests.push({ name: 'Configuração Resend', status: 'FALHOU', error: configTest.data });
  }
  
  await sleep(1000);

  // Teste 2: Verificar status SMTP do Supabase
  console.log('📋 TESTE 2: Status SMTP do Supabase');
  console.log('─'.repeat(50));
  
  const smtpTest = await makeRequest('/api/auth/check-smtp-status');
  
  results.total++;
  if (smtpTest.success) {
    console.log(`✅ TESTE 2 PASSOU: Status obtido - Estratégia recomendada: ${smtpTest.data.recommendedStrategy}`);
    results.passed++;
    results.tests.push({ 
      name: 'Status SMTP Supabase', 
      status: 'PASSOU', 
      details: {
        smtp: smtpTest.data.smtpConfigured,
        strategy: smtpTest.data.recommendedStrategy,
        publicSignup: smtpTest.data.publicSignupWorking
      }
    });
  } else {
    console.log('❌ TESTE 2 FALHOU: Não foi possível verificar status SMTP');
    results.failed++;
    results.tests.push({ name: 'Status SMTP Supabase', status: 'FALHOU', error: smtpTest.error });
  }
  
  await sleep(1000);

  // Teste 3: Testar envio de email via Resend
  console.log('📋 TESTE 3: Envio de Email de Teste');
  console.log('─'.repeat(50));
  
  const emailSendTest = await makeRequest('/api/test-email', {
    method: 'POST',
    body: JSON.stringify({ type: 'test-configuration' })
  });
  
  results.total++;
  if (emailSendTest.success && emailSendTest.data.success) {
    console.log('✅ TESTE 3 PASSOU: Email de teste enviado com sucesso');
    results.passed++;
    results.tests.push({ name: 'Envio Email Teste', status: 'PASSOU', details: 'Email enviado via Resend' });
  } else {
    console.log('❌ TESTE 3 FALHOU: Erro ao enviar email de teste');
    results.failed++;
    results.tests.push({ name: 'Envio Email Teste', status: 'FALHOU', error: emailSendTest.data });
  }
  
  await sleep(1000);

  // Teste 4: Criar usuário via signup-with-fallback
  console.log('📋 TESTE 4: Criação de Usuário com Fallback');
  console.log('─'.repeat(50));
  
  const signupTest = await makeRequest('/api/auth/signup-with-fallback', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME
    })
  });
  
  results.total++;
  if (signupTest.success && signupTest.data.success) {
    console.log(`✅ TESTE 4 PASSOU: Usuário criado via ${signupTest.data.method}`);
    console.log(`👤 ID do Usuário: ${signupTest.data.user?.id}`);
    console.log(`📧 Email Confirmado: ${signupTest.data.email_confirmed || signupTest.data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
    results.passed++;
    results.tests.push({ 
      name: 'Criação de Usuário', 
      status: 'PASSOU', 
      details: {
        method: signupTest.data.method,
        userId: signupTest.data.user?.id,
        emailConfirmed: !!signupTest.data.email_confirmed || !!signupTest.data.user?.email_confirmed_at
      }
    });
  } else {
    console.log('❌ TESTE 4 FALHOU: Erro ao criar usuário');
    results.failed++;
    results.tests.push({ name: 'Criação de Usuário', status: 'FALHOU', error: signupTest.data });
  }
  
  await sleep(1000);

  // Teste 5: Simular notificação de reserva (teste do sistema de email personalizado)
  console.log('📋 TESTE 5: Sistema de Email de Reserva');
  console.log('─'.repeat(50));
  
  const reservationEmailTest = await makeRequest('/api/test-email', {
    method: 'POST',
    body: JSON.stringify({
      type: 'admin-notification',
      reservationData: {
        id: `test-reservation-${Date.now()}`,
        nome: TEST_NAME,
        email: TEST_EMAIL,
        telefone: '(21) 99999-9999',
        data: new Date().toISOString().split('T')[0],
        horario: '19:00',
        pessoas: 2,
        observacoes: 'Teste do sistema de email',
        confirmationToken: 'test-token-123'
      }
    })
  });
  
  results.total++;
  if (reservationEmailTest.success && reservationEmailTest.data.success) {
    console.log('✅ TESTE 5 PASSOU: Email de reserva enviado com sucesso');
    results.passed++;
    results.tests.push({ name: 'Email de Reserva', status: 'PASSOU', details: 'Email enviado para admin' });
  } else {
    console.log('❌ TESTE 5 FALHOU: Erro ao enviar email de reserva');
    results.failed++;
    results.tests.push({ name: 'Email de Reserva', status: 'FALHOU', error: reservationEmailTest.data });
  }

  return results;
}

// Executar testes
async function main() {
  const startTime = performance.now();
  
  try {
    const results = await runTests();
    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    
    console.log('');
    console.log('📊 RESULTADOS FINAIS');
    console.log('═'.repeat(50));
    console.log(`⏱️  Tempo Total: ${totalTime}ms`);
    console.log(`🧪 Testes Executados: ${results.total}`);
    console.log(`✅ Testes Passou: ${results.passed}`);
    console.log(`❌ Testes Falharam: ${results.failed}`);
    console.log(`📈 Taxa de Sucesso: ${Math.round((results.passed / results.total) * 100)}%`);
    console.log('');
    
    console.log('📋 DETALHES DOS TESTES:');
    results.tests.forEach((test, index) => {
      const icon = test.status === 'PASSOU' ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${test.name}: ${test.status}`);
      if (test.details) {
        console.log(`   📋 Detalhes: ${JSON.stringify(test.details)}`);
      }
      if (test.error) {
        console.log(`   ❌ Erro: ${JSON.stringify(test.error)}`);
      }
    });
    
    console.log('');
    
    if (results.failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ Sistema de email está funcionando corretamente');
      process.exit(0);
    } else {
      console.log(`⚠️  ${results.failed} TESTE(S) FALHARAM`);
      console.log('❌ Verifique os problemas acima');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('');
    console.log('💥 ERRO FATAL NO TESTE:');
    console.log(error.message);
    console.log('');
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { makeRequest, runTests };