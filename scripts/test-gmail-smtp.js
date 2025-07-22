#!/usr/bin/env node

/**
 * Script de teste específico para SMTP Gmail no Supabase
 * Armazém São Joaquim - Verificação de Email
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurações
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 TESTE SMTP GMAIL - SUPABASE');
console.log('==============================');
console.log(`🌐 URL: ${SUPABASE_URL ? 'Configurado' : 'NÃO CONFIGURADO'}`);
console.log(`🔐 Service Key: ${SUPABASE_SERVICE_KEY ? 'Configurado' : 'NÃO CONFIGURADO'}`);
console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY ? 'Configurado' : 'NÃO CONFIGURADO'}`);
console.log('');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.log('❌ ERRO: Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

// Teste direto com Supabase
async function testSupabaseSmtp() {
  const testResults = {
    adminInvite: null,
    publicSignup: null,
    testUsers: []
  };

  try {
    console.log('📧 TESTE 1: Admin Invite (Service Role)');
    console.log('─'.repeat(50));

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const testEmail = `smtp-test-${Date.now()}@example.com`;
    
    console.log(`🔄 Tentando convite para: ${testEmail}`);
    
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(testEmail, {
      redirectTo: 'https://armazemsaojoaquim.netlify.app/auth/callback',
      data: {
        full_name: 'Test User SMTP'
      }
    });

    if (inviteError) {
      console.log(`❌ ERRO Admin Invite: ${inviteError.message}`);
      testResults.adminInvite = { success: false, error: inviteError.message };
    } else {
      console.log(`✅ SUCCESS Admin Invite: ${JSON.stringify(inviteData, null, 2)}`);
      testResults.adminInvite = { success: true, data: inviteData };
      if (inviteData.user) {
        testResults.testUsers.push(inviteData.user.id);
      }
    }

  } catch (error) {
    console.log(`💥 ERRO FATAL Admin Invite: ${error.message}`);
    testResults.adminInvite = { success: false, error: error.message };
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    console.log('');
    console.log('📧 TESTE 2: Public Signup (Anon Key)');
    console.log('─'.repeat(50));

    const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const testEmail2 = `signup-test-${Date.now()}@example.com`;
    
    console.log(`🔄 Tentando signup para: ${testEmail2}`);
    
    const { data: signupData, error: signupError } = await publicClient.auth.signUp({
      email: testEmail2,
      password: 'TestSMTP123!',
      options: {
        data: {
          full_name: 'Test User Public SMTP'
        }
      }
    });

    if (signupError) {
      console.log(`❌ ERRO Public Signup: ${signupError.message}`);
      testResults.publicSignup = { success: false, error: signupError.message };
    } else {
      console.log(`✅ SUCCESS Public Signup: ${JSON.stringify(signupData, null, 2)}`);
      testResults.publicSignup = { success: true, data: signupData };
      if (signupData.user) {
        testResults.testUsers.push(signupData.user.id);
      }
    }

  } catch (error) {
    console.log(`💥 ERRO FATAL Public Signup: ${error.message}`);
    testResults.publicSignup = { success: false, error: error.message };
  }

  return testResults;
}

// Limpeza de usuários de teste
async function cleanupTestUsers(userIds) {
  if (userIds.length === 0) return;

  try {
    console.log('');
    console.log('🧹 LIMPEZA: Removendo usuários de teste');
    console.log('─'.repeat(50));

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    for (const userId of userIds) {
      try {
        const { error } = await adminClient.auth.admin.deleteUser(userId);
        if (error) {
          console.log(`⚠️  Não foi possível remover usuário ${userId}: ${error.message}`);
        } else {
          console.log(`✅ Usuário ${userId} removido`);
        }
      } catch (err) {
        console.log(`⚠️  Erro ao remover usuário ${userId}: ${err.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Erro na limpeza: ${error.message}`);
  }
}

// Análise de resultados
function analyzeResults(results) {
  console.log('');
  console.log('📊 ANÁLISE DOS RESULTADOS');
  console.log('═'.repeat(50));

  const adminWorking = results.adminInvite?.success === true;
  const publicWorking = results.publicSignup?.success === true;

  console.log(`🔧 Admin Invite: ${adminWorking ? '✅ FUNCIONANDO' : '❌ FALHOU'}`);
  console.log(`👥 Public Signup: ${publicWorking ? '✅ FUNCIONANDO' : '❌ FALHOU'}`);

  if (adminWorking && publicWorking) {
    console.log('');
    console.log('🎉 SMTP GMAIL TOTALMENTE FUNCIONAL!');
    console.log('✅ Ambos os métodos de envio funcionam');
    console.log('📧 Emails devem estar sendo enviados via Gmail SMTP');
    console.log('🏆 Recomendação: Usar signup público para melhor UX');
  } else if (adminWorking) {
    console.log('');
    console.log('⚠️  SMTP PARCIALMENTE FUNCIONAL');
    console.log('✅ Admin invite funciona');
    console.log('❌ Public signup tem problemas');
    console.log('🏆 Recomendação: Usar fallback para admin invite');
  } else if (publicWorking) {
    console.log('');
    console.log('⚠️  SMTP PARCIALMENTE FUNCIONAL');
    console.log('❌ Admin invite tem problemas');
    console.log('✅ Public signup funciona');
    console.log('🏆 Recomendação: Usar signup público');
  } else {
    console.log('');
    console.log('💥 SMTP NÃO FUNCIONAL');
    console.log('❌ Ambos os métodos falharam');
    console.log('🔧 Verifique configuração SMTP no dashboard Supabase');
    console.log('📧 Confirme as credenciais Gmail');
  }

  // Detalhes dos erros
  if (!adminWorking && results.adminInvite?.error) {
    console.log('');
    console.log('🔍 DETALHES ERRO ADMIN:');
    console.log(results.adminInvite.error);
  }

  if (!publicWorking && results.publicSignup?.error) {
    console.log('');
    console.log('🔍 DETALHES ERRO PUBLIC:');
    console.log(results.publicSignup.error);
  }

  return {
    smtpConfigured: adminWorking || publicWorking,
    recommendedStrategy: adminWorking && publicWorking ? 'public' : adminWorking ? 'admin' : publicWorking ? 'public' : 'none',
    adminWorking,
    publicWorking
  };
}

// Função principal
async function main() {
  const startTime = Date.now();

  try {
    console.log('🚀 Iniciando testes SMTP...');
    console.log('');

    const results = await testSupabaseSmtp();
    const analysis = analyzeResults(results);

    // Limpeza opcional
    if (results.testUsers.length > 0) {
      await cleanupTestUsers(results.testUsers);
    }

    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('⏱️  RESUMO FINAL');
    console.log('═'.repeat(30));
    console.log(`🕒 Tempo total: ${duration}ms`);
    console.log(`📧 SMTP configurado: ${analysis.smtpConfigured ? 'SIM' : 'NÃO'}`);
    console.log(`🎯 Estratégia: ${analysis.recommendedStrategy}`);
    console.log('');

    if (analysis.smtpConfigured) {
      console.log('🎊 TESTE CONCLUÍDO COM SUCESSO!');
      console.log('✉️  Sistema de email está funcionando via Gmail SMTP');
      process.exit(0);
    } else {
      console.log('🚨 TESTE FALHOU!');
      console.log('❌ Sistema de email precisa ser verificado');
      process.exit(1);
    }

  } catch (error) {
    console.log('');
    console.log('💥 ERRO FATAL NO TESTE:');
    console.log(error.message);
    console.log(error.stack);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { testSupabaseSmtp, analyzeResults };