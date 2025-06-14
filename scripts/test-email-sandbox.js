#!/usr/bin/env node

/**
 * Script para testar o sistema de detecção de sandbox e fallback de emails
 * Armazém São Joaquim
 */

const fs = require('fs');
const path = require('path');

// Função para carregar variáveis de ambiente
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
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key] = value;
                }
            }
        });
    }
}

// Carregar variáveis de ambiente
loadEnvVars();

// Configuração
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log('🧪 TESTE DE SISTEMA DE EMAIL SANDBOX - ARMAZÉM SÃO JOAQUIM');
console.log('========================================================');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log('');

async function testEmailConfiguration() {
    console.log('📧 TESTANDO CONFIGURAÇÃO DE EMAIL');
    console.log('=================================');
    
    try {
        const response = await fetch(`${BASE_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'configuration'
            })
        });

        const result = await response.json();
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📋 Configuração atual:');
        console.log('   - Configurado:', result.isConfigured ? '✅' : '❌');
        console.log('   - From Email:', result.fromEmail);
        console.log('   - Admin Email:', result.adminEmail);
        console.log('   - Modo Sandbox:', result.isSandboxMode ? '🧪 SIM' : '🚀 NÃO');
        console.log('   - Email de Destino Real:', result.actualDestinationEmail);
        console.log('   - Nota:', result.note);
        console.log('');
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao testar configuração:', error.message);
        return null;
    }
}

async function testAdminNotification() {
    console.log('📬 TESTANDO NOTIFICAÇÃO PARA ADMIN');
    console.log('==================================');
    
    const testReservation = {
        id: 'test-' + Date.now(),
        nome: 'João Silva (TESTE)',
        email: 'joao.teste@email.com',
        telefone: '21987654321',
        data: '2025-07-30',
        horario: '19:30:00',
        pessoas: 4,
        observacoes: 'Mesa próxima à janela, se possível',
        confirmationToken: 'test-token-' + Date.now()
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'admin-notification',
                reservationData: testReservation
            })
        });

        const result = await response.json();
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📧 Resultado do envio:', result.success ? '✅ SUCESSO' : '❌ FALHA');
        
        if (result.success) {
            console.log('🎉 Email de notificação enviado com sucesso!');
            console.log('📝 Dados da reserva teste enviados:');
            console.log('   - Nome:', testReservation.nome);
            console.log('   - Email:', testReservation.email);
            console.log('   - Data:', testReservation.data);
            console.log('   - Horário:', testReservation.horario);
            console.log('   - Pessoas:', testReservation.pessoas);
        } else {
            console.log('❌ Erro no envio:', result.error);
        }
        
        console.log('');
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao testar notificação admin:', error.message);
        return null;
    }
}

async function testSandboxDetection() {
    console.log('🔍 TESTANDO DETECÇÃO DE MODO SANDBOX');
    console.log('====================================');
    
    try {
        const response = await fetch(`${BASE_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'sandbox-test'
            })
        });

        const result = await response.json();
        
        console.log('📊 Status da resposta:', response.status);
        console.log('🧪 Modo Sandbox detectado:', result.isSandboxMode ? '✅ SIM' : '❌ NÃO');
        console.log('📧 Email de destino:', result.destinationEmail);
        console.log('💡 Explicação:', result.explanation);
        console.log('');
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao testar detecção de sandbox:', error.message);
        return null;
    }
}

async function runAllTests() {
    console.log('🚀 INICIANDO TODOS OS TESTES...');
    console.log('');
    
    // Teste 1: Configuração
    const config = await testEmailConfiguration();
    
    // Teste 2: Detecção de Sandbox
    const sandbox = await testSandboxDetection();
    
    // Teste 3: Notificação Admin
    const notification = await testAdminNotification();
    
    console.log('📊 RESUMO DOS TESTES');
    console.log('===================');
    console.log('✅ Configuração:', config ? 'OK' : 'FALHA');
    console.log('✅ Detecção Sandbox:', sandbox ? 'OK' : 'FALHA');
    console.log('✅ Notificação Admin:', notification?.success ? 'OK' : 'FALHA');
    console.log('');
    
    if (config?.isSandboxMode) {
        console.log('💡 DICA IMPORTANTE:');
        console.log('   Para enviar emails para o endereço real do restaurante,');
        console.log('   configure um domínio verificado no Resend e altere o');
        console.log('   fromEmail para usar esse domínio.');
        console.log('');
    }
    
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Teste fazer uma reserva real no site');
    console.log('   2. Confirme a reserva clicando no link do email');
    console.log('   3. Verifique se o email de notificação chegou');
    console.log('');
}

// Executar todos os testes
runAllTests().catch(console.error); 