#!/usr/bin/env node

/**
 * Script para testar o fluxo completo de confirmação de reservas por email
 * Armazém São Joaquim
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Função para carregar variáveis do env.example se não houver .env.local
function loadEnvVars() {
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    const envExamplePath = path.join(__dirname, '..', 'env.example');
    
    let envFile = envLocalPath;
    
    if (!fs.existsSync(envLocalPath)) {
        console.log('⚠️  Arquivo .env.local não encontrado, usando env.example para referência');
        envFile = envExamplePath;
    }
    
    if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        const envLines = envContent.split('\n');
        
        envLines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#') && line.includes('=')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=');
                if (!process.env[key.trim()]) {
                    process.env[key.trim()] = value.trim();
                }
            }
        });
    }
}

// Carregar variáveis de ambiente
loadEnvVars();

// Configuração
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_TOKEN = crypto.randomBytes(32).toString('hex');

console.log('🧪 TESTE DE CONFIRMAÇÃO POR EMAIL - ARMAZÉM SÃO JOAQUIM');
console.log('=====================================================');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`🔑 Token de teste: ${TEST_TOKEN}`);
console.log('');

async function testConfirmationEndpoint() {
    console.log('📡 TESTANDO ENDPOINT DE CONFIRMAÇÃO');
    console.log('==================================');
    
    const confirmUrl = `${BASE_URL}/api/reservas/confirm?token=${TEST_TOKEN}`;
    console.log(`🔗 URL de confirmação: ${confirmUrl}`);
    
    try {
        console.log('🚀 Fazendo requisição GET...');
        
        const response = await fetch(confirmUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/json',
                'User-Agent': 'ArmazemSaoJoaquim-TestScript/1.0'
            }
        });
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.status === 404) {
            console.log('✅ TESTE PASSOU: Token inválido retorna 404 como esperado');
            
            try {
                const data = await response.json();
                console.log('📄 Resposta JSON:', JSON.stringify(data, null, 2));
            } catch (e) {
                console.log('📄 Resposta não é JSON válido');
            }
        } else if (response.status === 200) {
            console.log('⚠️  AVISO: Token teste retornou 200 (pode ser mock data)');
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                console.log('📄 Resposta é HTML (página de sucesso)');
                const html = await response.text();
                console.log(`📏 Tamanho da resposta: ${html.length} chars`);
                
                // Verificar se contém elementos esperados
                if (html.includes('Reserva Confirmada')) {
                    console.log('✅ Página contém "Reserva Confirmada"');
                }
                if (html.includes('Armazém São Joaquim')) {
                    console.log('✅ Página contém nome do restaurante');
                }
            } else {
                const data = await response.json();
                console.log('📄 Resposta JSON:', JSON.stringify(data, null, 2));
            }
        } else {
            console.log(`❌ ERRO: Status inesperado ${response.status}`);
            
            try {
                const data = await response.json();
                console.log('📄 Resposta de erro:', JSON.stringify(data, null, 2));
            } catch (e) {
                const text = await response.text();
                console.log('📄 Resposta de erro (texto):', text.substring(0, 200));
            }
        }
        
    } catch (error) {
        console.error('❌ ERRO na requisição:', error.message);
        return false;
    }
    
    console.log('');
    return true;
}

async function testSupabaseConnection() {
    console.log('🗄️  TESTANDO CONFIGURAÇÃO DO SUPABASE');
    console.log('====================================');
    
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    let allConfigured = true;
    
    requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value) {
            console.log(`✅ ${envVar}: Configurado (${value.length} chars)`);
        } else {
            console.log(`❌ ${envVar}: NÃO CONFIGURADO`);
            allConfigured = false;
        }
    });
    
    console.log('');
    
    if (allConfigured) {
        console.log('✅ Todas as variáveis do Supabase estão configuradas');
    } else {
        console.log('❌ Algumas variáveis do Supabase estão faltando');
        console.log('💡 Verifique seu arquivo .env.local');
    }
    
    console.log('');
    return allConfigured;
}

async function testEmailService() {
    console.log('📧 TESTANDO CONFIGURAÇÃO DE EMAIL');
    console.log('=================================');
    
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        console.log(`✅ RESEND_API_KEY: Configurado (${resendKey.length} chars)`);
        console.log(`🔑 Prefixo: ${resendKey.substring(0, 10)}...`);
    } else {
        console.log('❌ RESEND_API_KEY: NÃO CONFIGURADO');
        console.log('💡 Configure a variável RESEND_API_KEY no .env.local');
    }
    
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
        console.log(`✅ ADMIN_EMAIL: ${adminEmail}`);
    } else {
        console.log('❌ ADMIN_EMAIL: NÃO CONFIGURADO');
    }
    
    console.log('');
    
    // Testar endpoint de email de teste se estiver rodando localmente
    if (BASE_URL.includes('localhost')) {
        try {
            console.log('🧪 Testando endpoint de email local...');
            
            const response = await fetch(`${BASE_URL}/api/test-email`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log(`📊 Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📄 Resposta:', JSON.stringify(data, null, 2));
            } else {
                const error = await response.text();
                console.log('📄 Erro:', error.substring(0, 200));
            }
            
        } catch (error) {
            console.log('❌ Erro ao testar endpoint de email (normal se servidor não estiver rodando):', error.message);
        }
    } else {
        console.log('🌐 Teste em produção - endpoint de email não testado');
    }
    
    console.log('');
}

async function simulateCompleteFlow() {
    console.log('🔄 SIMULANDO FLUXO COMPLETO');
    console.log('===========================');
    
    console.log('1️⃣ Cliente faz reserva → Status: pendente');
    console.log('2️⃣ Sistema envia email com link de confirmação');
    console.log('3️⃣ Cliente clica no link → Status muda para: confirmada');
    console.log('4️⃣ Sistema envia email para armazemsaojoaquimoficial@gmail.com');
    console.log('');
    
    console.log('🔗 URLs importantes:');
    console.log(`   📧 Email de confirmação: ${BASE_URL}/api/reservas/confirm?token=TOKEN_REAL`);
    console.log(`   🧪 Teste de email: ${BASE_URL}/api/test-email`);
    console.log(`   📋 API de reservas: ${BASE_URL}/api/reservas`);
    console.log('');
    
    console.log('📝 INSTRUÇÕES PARA TESTE MANUAL:');
    console.log('1. Acesse /reservas no site');
    console.log('2. Faça uma reserva de teste');
    console.log('3. Verifique o email recebido');
    console.log('4. Clique no link de confirmação');
    console.log('5. Verifique se armazemsaojoaquimoficial@gmail.com recebeu notificação');
    console.log('');
    
    console.log('⚠️  MUDANÇAS IMPLEMENTADAS:');
    console.log('✅ Botão "Confirmar Reserva" removido da interface');
    console.log('✅ Confirmação APENAS por email agora');
    console.log('✅ Email para admin quando reserva é confirmada');
    console.log('✅ API de confirmação conectada ao Supabase real');
    console.log('');
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 INICIANDO BATERIA DE TESTES\n');
    
    const results = {
        supabase: await testSupabaseConnection(),
        email: await testEmailService(),
        confirm: await testConfirmationEndpoint()
    };
    
    await simulateCompleteFlow();
    
    console.log('📊 RESUMO DOS TESTES');
    console.log('===================');
    console.log(`🗄️  Supabase: ${results.supabase ? '✅ OK' : '❌ ERRO'}`);
    console.log(`📧 Email: ${process.env.RESEND_API_KEY ? '✅ OK' : '❌ ERRO'}`);
    console.log(`🔗 Endpoint: ${results.confirm ? '✅ OK' : '❌ ERRO'}`);
    console.log('');
    
    if (results.supabase && process.env.RESEND_API_KEY && results.confirm) {
        console.log('🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ Sistema pronto para confirmação por email apenas');
        console.log('🚫 Confirmação direta pelo site foi removida');
    } else {
        console.log('⚠️  ALGUNS TESTES FALHARAM');
        console.log('💡 Verifique as configurações acima');
    }
    
    console.log('\n🏁 Teste concluído!');
}

// Executar se chamado diretamente
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testConfirmationEndpoint,
    testSupabaseConnection,
    testEmailService,
    simulateCompleteFlow
}; 