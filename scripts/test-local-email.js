#!/usr/bin/env node

/**
 * Script para testar o sistema de email localmente
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

console.log('🧪 TESTE LOCAL DE EMAIL - ARMAZÉM SÃO JOAQUIM');
console.log('=============================================');
console.log('');

async function testEmailService() {
    try {
        // Como estamos em Node.js, vamos simular o teste sem importar diretamente
        // Vamos testar via API local
        console.log('⚠️  Testando via API local (servidor deve estar rodando)');
        
        console.log('📧 TESTANDO CONFIGURAÇÃO DO EMAIL SERVICE');
        console.log('=========================================');
        
        const config = emailService.getConfiguration();
        
        console.log('📋 Configuração atual:');
        console.log('   - Configurado:', config.isConfigured ? '✅' : '❌');
        console.log('   - From Email:', config.fromEmail);
        console.log('   - Admin Email:', config.adminEmail);
        console.log('   - Reply To:', config.replyToEmail);
        console.log('   - Modo Sandbox:', config.isSandboxMode ? '🧪 SIM' : '🚀 NÃO');
        console.log('   - Email de Destino Real:', config.actualDestinationEmail);
        console.log('   - Developer Email:', config.developerEmail);
        console.log('   - Nota:', config.note);
        console.log('');
        
        if (!config.isConfigured) {
            console.log('❌ Email service não está configurado. Verifique as variáveis de ambiente.');
            return;
        }
        
        console.log('🧪 TESTANDO DETECÇÃO DE SANDBOX');
        console.log('===============================');
        
        if (config.isSandboxMode) {
            console.log('✅ Modo SANDBOX detectado corretamente');
            console.log('📧 Emails serão enviados para:', config.developerEmail);
            console.log('💡 Para enviar para o email real, configure um domínio verificado no Resend');
        } else {
            console.log('✅ Modo PRODUÇÃO detectado');
            console.log('📧 Emails serão enviados para:', config.adminEmail);
        }
        console.log('');
        
        console.log('📬 TESTANDO NOTIFICAÇÃO PARA ADMIN');
        console.log('==================================');
        
        const testReservation = {
            id: 'test-local-' + Date.now(),
            nome: 'Maria Silva (TESTE LOCAL)',
            email: 'maria.teste@email.com',
            telefone: '21987654321',
            data: '2025-08-15',
            horario: '20:00:00',
            pessoas: 6,
            observacoes: 'Aniversário - mesa especial',
            confirmationToken: 'test-token-local-' + Date.now()
        };
        
        console.log('📝 Dados da reserva teste:');
        console.log('   - Nome:', testReservation.nome);
        console.log('   - Email:', testReservation.email);
        console.log('   - Data:', testReservation.data);
        console.log('   - Horário:', testReservation.horario);
        console.log('   - Pessoas:', testReservation.pessoas);
        console.log('   - Observações:', testReservation.observacoes);
        console.log('');
        
        console.log('📤 Enviando email de notificação...');
        
        const result = await emailService.sendAdminNotification(testReservation);
        
        if (result.success) {
            console.log('✅ Email enviado com sucesso!');
            console.log('🎉 O sistema de detecção de sandbox está funcionando corretamente');
            
            if (config.isSandboxMode) {
                console.log('📧 Email foi enviado para:', config.developerEmail);
                console.log('💡 Em produção, seria enviado para:', config.adminEmail);
            } else {
                console.log('📧 Email foi enviado para:', config.adminEmail);
            }
        } else {
            console.log('❌ Erro ao enviar email:', result.error);
        }
        
        console.log('');
        console.log('🎯 RESUMO DO TESTE');
        console.log('==================');
        console.log('✅ Configuração:', config.isConfigured ? 'OK' : 'FALHA');
        console.log('✅ Detecção Sandbox:', config.isSandboxMode !== undefined ? 'OK' : 'FALHA');
        console.log('✅ Envio de Email:', result.success ? 'OK' : 'FALHA');
        console.log('');
        
        if (result.success) {
            console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
            console.log('');
            console.log('🔄 PRÓXIMOS PASSOS:');
            console.log('   1. Faça uma reserva real no site');
            console.log('   2. Confirme a reserva clicando no link do email');
            console.log('   3. Verifique se o email de notificação chegou no destino correto');
            
            if (config.isSandboxMode) {
                console.log('');
                console.log('⚠️  IMPORTANTE: Você está em modo SANDBOX');
                console.log('   Para receber emails no endereço real do restaurante:');
                console.log('   1. Configure um domínio verificado no Resend');
                console.log('   2. Altere o fromEmail para usar esse domínio');
                console.log('   3. O sistema automaticamente detectará e enviará para o admin real');
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste
testEmailService().catch(console.error); 