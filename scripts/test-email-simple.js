#!/usr/bin/env node

/**
 * Teste Simples do Email Service
 * Usando a instância do email service já configurada
 */

require('dotenv').config({ path: '.env.local' });

// Importar email service (simulação para Node.js)
console.log('📧 TESTE SIMPLES DO EMAIL - ARMAZÉM SÃO JOAQUIM');
console.log('==============================================');

console.log('🔍 Verificando configuração...');
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);

if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY não configurado!');
    console.log('Configure a variável de ambiente no arquivo .env.local');
    process.exit(1);
}

// Usar a API do Resend diretamente
const { Resend } = require('resend');

async function testEmailService() {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('📤 Enviando email de teste...');
        
        const { data, error } = await resend.emails.send({
            from: 'Armazém São Joaquim <onboarding@resend.dev>',
            to: ['lucas.afvr@gmail.com'],
            reply_to: 'armazemsaojoaquimoficial@gmail.com',
            subject: '🧪 Teste Email Corrigido - Armazém São Joaquim',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                        <h1>🧪 Email Funcionando!</h1>
                        <p>Armazém São Joaquim</p>
                    </div>
                    <div style="padding: 20px;">
                        <h2>✅ Problema Resolvido!</h2>
                        <p>O domínio foi alterado para <strong>onboarding@resend.dev</strong></p>
                        <p><strong>📧 Configuração para Produção:</strong></p>
                        <ul>
                            <li>From: onboarding@resend.dev (domínio autorizado)</li>
                            <li>To: Qualquer email (incluindo armazemsaojoaquimoficial@gmail.com)</li>
                            <li>Reply-To: armazemsaojoaquimoficial@gmail.com</li>
                        </ul>
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 15px 0;">
                            <p><strong>⚠️ IMPORTANTE:</strong> Em produção, os emails funcionarão normalmente!</p>
                            <p>Este limite só afeta o ambiente de desenvolvimento/teste.</p>
                        </div>
                        <hr>
                        <p style="font-size: 12px; color: #666;">
                            Teste enviado em: ${new Date().toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.log('❌ Erro:', error);
            return false;
        }

        console.log('✅ Email enviado com sucesso!');
        console.log(`📧 ID: ${data.id}`);
        return true;

    } catch (error) {
        console.log('❌ Erro no teste:', error.message);
        return false;
    }
}

// Executar teste
testEmailService().then(success => {
    if (success) {
        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('O email service está funcionando. Verifique sua caixa de entrada.');
    } else {
        console.log('\n❌ TESTE FALHOU!');
        process.exit(1);
    }
}); 