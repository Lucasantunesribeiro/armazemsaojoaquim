#!/usr/bin/env node

/**
 * Script de Teste da API de Reservas
 * Testa conexão com Supabase e funcionalidades básicas
 */

const https = require('https');
const http = require('http');

// Configurações do teste
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://armazemsaojoaquim.netlify.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://enolssforaepnrpfrima.supabase.co';

console.log('🧪 TESTE DE DIAGNÓSTICO - API ARMAZÉM SÃO JOAQUIM');
console.log('================================================');
console.log(`🌐 Site URL: ${SITE_URL}`);
console.log(`🗄️  Supabase URL: ${SUPABASE_URL}`);
console.log('');

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const req = client.request(url, {
            method: 'GET',
            timeout: 10000,
            ...options
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

// Teste 1: Verificar se o site está online
async function testSiteAvailability() {
    console.log('1️⃣  Testando disponibilidade do site...');
    
    try {
        const response = await makeRequest(SITE_URL);
        
        if (response.statusCode === 200) {
            console.log('   ✅ Site está online e respondendo');
        } else {
            console.log(`   ❌ Site retornou status: ${response.statusCode}`);
        }
        
        return response.statusCode === 200;
    } catch (error) {
        console.log(`   ❌ Erro ao acessar site: ${error.message}`);
        return false;
    }
}

// Teste 2: Verificar conexão com Supabase
async function testSupabaseConnection() {
    console.log('2️⃣  Testando conexão com Supabase...');
    
    try {
        const response = await makeRequest(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.statusCode === 200) {
            console.log('   ✅ Supabase está acessível');
        } else {
            console.log(`   ❌ Supabase retornou status: ${response.statusCode}`);
        }
        
        return response.statusCode === 200;
    } catch (error) {
        console.log(`   ❌ Erro ao conectar com Supabase: ${error.message}`);
        return false;
    }
}

// Teste 3: Verificar API de reservas
async function testReservationsAPI() {
    console.log('3️⃣  Testando API de reservas...');
    
    try {
        const response = await makeRequest(`${SITE_URL}/api/reservas`);
        
        if (response.statusCode === 200) {
            console.log('   ✅ API de reservas está funcionando');
        } else if (response.statusCode === 405) {
            console.log('   ✅ API de reservas responde (método não permitido é esperado para GET)');
        } else if (response.statusCode === 500) {
            console.log('   ❌ ERRO 500 na API de reservas - Este é o problema!');
            console.log(`   📄 Response body: ${response.body.substring(0, 200)}...`);
        } else {
            console.log(`   ⚠️  API retornou status: ${response.statusCode}`);
        }
        
        return response.statusCode === 200 || response.statusCode === 405;
    } catch (error) {
        console.log(`   ❌ Erro ao testar API de reservas: ${error.message}`);
        return false;
    }
}

// Teste 4: Verificar health check
async function testHealthCheck() {
    console.log('4️⃣  Testando health check...');
    
    try {
        const response = await makeRequest(`${SITE_URL}/api/health`);
        
        if (response.statusCode === 200) {
            console.log('   ✅ Health check OK');
            console.log(`   📊 Response: ${response.body}`);
        } else {
            console.log(`   ❌ Health check falhou: ${response.statusCode}`);
        }
        
        return response.statusCode === 200;
    } catch (error) {
        console.log(`   ❌ Erro no health check: ${error.message}`);
        return false;
    }
}

// Executar todos os testes
async function runDiagnostics() {
    console.log('🚀 Iniciando diagnósticos...\n');
    
    const results = {
        site: await testSiteAvailability(),
        supabase: await testSupabaseConnection(),
        reservations: await testReservationsAPI(),
        health: await testHealthCheck()
    };
    
    console.log('\n📊 RESULTADO DOS TESTES:');
    console.log('========================');
    console.log(`Site Online: ${results.site ? '✅' : '❌'}`);
    console.log(`Supabase: ${results.supabase ? '✅' : '❌'}`);
    console.log(`API Reservas: ${results.reservations ? '✅' : '❌'}`);
    console.log(`Health Check: ${results.health ? '✅' : '❌'}`);
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log(`\n🎯 SCORE: ${passed}/${total} testes passaram`);
    
    if (!results.reservations) {
        console.log('\n🔧 AÇÕES RECOMENDADAS:');
        console.log('1. Execute a migração no Supabase Dashboard');
        console.log('2. Configure as variáveis de ambiente no Netlify');
        console.log('3. Verifique os logs do Netlify Functions');
        console.log('4. Teste novamente');
    }
    
    return results;
}

// Executar se chamado diretamente
if (require.main === module) {
    runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics }; 