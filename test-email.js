#!/usr/bin/env node

/**
 * Script de Teste do Email Service Corrigido
 * Testa o envio de emails com o novo domínio sandbox
 */

require('dotenv').config({ path: '.env.local' });

// Simulação do módulo (no Node.js simples)
const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = 'armazemsaojoaquimoficial@gmail.com';

console.log('📧 TESTE DO EMAIL SERVICE - ARMAZÉM SÃO JOAQUIM');
console.log('===============================================');
console.log(`🔑 API Key: ${RESEND_API_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
console.log(`📩 Email de Teste: ${TEST_EMAIL}`);
console.log('');

// Função para testar o Resend diretamente
async function testResendAPI() {
    if (!RESEND_API_KEY) {
        console.log('❌ RESEND_API_KEY não configurado!');
        return;
    }

    const emailData = {
        from: 'Armazém São Joaquim <onboarding@resend.dev>', // DOMÍNIO CORRIGIDO
        to: [TEST_EMAIL],
        subject: '🧪 Teste de Email Corrigido - Armazém São Joaquim',
        html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;"><h1>🧪 Teste de Email Corrigido</h1><p>Armazém São Joaquim - Email Service</p></div><div style="padding: 20px;"><h2>✅ Problemas Resolvidos:</h2><ul><li>✅ Domínio alterado para <code>onboarding@resend.dev</code></li><li>✅ Erro 403 corrigido</li><li>✅ Emails devem chegar normalmente</li></ul><h3>📧 Configuração Atual:</h3><ul><li><strong>From:</strong> Armazém São Joaquim &lt;onboarding@resend.dev&gt;</li><li><strong>Reply-To:</strong> armazemsaojoaquimoficial@gmail.com</li><li><strong>Status:</strong> ✅ Funcionando</li></ul><div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;"><p><strong>🎉 Se você recebeu este email, o problema foi resolvido!</strong></p><p>As reservas agora devem enviar emails de confirmação normalmente.</p></div><hr><p style="font-size: 12px; color: #666;">Enviado em: ' + new Date().toLocaleString('pt-BR') + '<br>Sistema: Armazém São Joaquim<br>Teste: Email Service Corrigido</p></div></div>'
    };

    console.log('📤 Enviando email de teste...');
    
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(emailData);
        
        const options = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'User-Agent': 'ArmazemSaoJoaquim-EmailTest/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedResponse = JSON.parse(responseData);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Email enviado com sucesso!');
                        console.log(`📧 ID: ${parsedResponse.id}`);
                        console.log(`📬 Para: ${TEST_EMAIL}`);
                        console.log('🎉 Verifique sua caixa de entrada!');
                        resolve(parsedResponse);
                    } else {
                        console.log('❌ Erro ao enviar email:');
                        console.log(`Status: ${res.statusCode}`);
                        console.log('Response:', parsedResponse);
                        reject(new Error(parsedResponse.message || 'Erro desconhecido'));
                    }
                } catch (error) {
                    console.log('❌ Erro ao processar resposta:', error.message);
                    console.log('Raw response:', responseData);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Erro na requisição:', error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Função para testar dados de reserva
function testReservationData() {
    console.log('📋 TESTE DE DADOS DE RESERVA');
    console.log('============================');
    
    const reservationSample = {
        id: '12345678-1234-1234-1234-123456789abc',
        nome: 'João Silva (TESTE)',
        email: 'joao.teste@email.com',
        telefone: '21999887766',
        data: '2024-12-25',
        horario: '19:30',
        pessoas: 4,
        observacoes: 'Mesa próxima à janela, se possível',
        confirmationToken: 'abc123def456'
    };
    
    console.log('✅ Dados de exemplo:');
    Object.entries(reservationSample).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });
    
    return reservationSample;
}

// Executar testes
async function runTests() {
    try {
        console.log('🚀 Iniciando testes...\n');
        
        // Teste 1: Dados de reserva
        testReservationData();
        console.log('');
        
        // Teste 2: API do Resend
        await testResendAPI();
        
        console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS!');
        console.log('Se você recebeu o email, o sistema está funcionando corretamente.');
        
    } catch (error) {
        console.log('\n❌ ERRO NOS TESTES:');
        console.log(error.message);
        process.exit(1);
    }
}

// Verificar se é execução direta
if (require.main === module) {
    runTests();
} 