#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuração dos testes
const BASE_URL = process.env.SITE_URL || 'https://armazemsaojoaquim.netlify.app';
const API_ENDPOINTS = [
  '/api/health',
  '/api/hello', 
  '/api/reservas'
];

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ProductionTest/1.0'
      }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          contentType: res.headers['content-type'] || ''
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Teste para verificar se APIs retornam JSON
async function testApiJsonResponse(endpoint) {
  console.log(`\n🔍 Testando: ${endpoint}`);
  
  try {
    const response = await makeRequest(`${BASE_URL}${endpoint}`);
    
    // Verifica se o status code é válido
    const isValidStatus = response.statusCode >= 200 && response.statusCode < 500;
    console.log(`   Status: ${response.statusCode} ${isValidStatus ? '✅' : '❌'}`);
    
    // Verifica se Content-Type é JSON
    const isJson = response.contentType.includes('application/json');
    console.log(`   Content-Type: ${response.contentType} ${isJson ? '✅' : '❌'}`);
    
    // Verifica se o corpo é JSON válido
    let isValidJson = false;
    try {
      JSON.parse(response.body);
      isValidJson = true;
    } catch (e) {
      console.log(`   JSON inválido: ${e.message}`);
    }
    console.log(`   JSON válido: ${isValidJson ? '✅' : '❌'}`);
    
    // Verifica headers CORS
    const hasCorsCHeaders = response.headers['access-control-allow-origin'];
    console.log(`   CORS headers: ${hasCorsCHeaders ? '✅' : '❌'}`);
    
    return {
      endpoint,
      statusCode: response.statusCode,
      isJson,
      isValidJson,
      hasCors: !!hasCorsCHeaders,
      passed: isValidStatus && isJson && isValidJson
    };
    
  } catch (error) {
    console.log(`   Erro: ${error.message} ❌`);
    return {
      endpoint,
      error: error.message,
      passed: false
    };
  }
}

// Teste específico para POST na API de reservas
async function testReservasPost() {
  console.log(`\n🔍 Testando POST /api/reservas`);
  
  const testData = {
    user_id: 'test-user-123',
    nome: 'Test User',
    email: 'test@example.com',
    telefone: '(21) 99999-9999',
    data: '2024-12-31',
    horario: '19:00',
    pessoas: 2,
    observacoes: 'Teste de produção'
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const isValidStatus = response.statusCode === 201 || response.statusCode === 400;
    console.log(`   Status: ${response.statusCode} ${isValidStatus ? '✅' : '❌'}`);
    
    const isJson = response.contentType.includes('application/json');
    console.log(`   Content-Type: ${response.contentType} ${isJson ? '✅' : '❌'}`);
    
    let isValidJson = false;
    let responseData = null;
    try {
      responseData = JSON.parse(response.body);
      isValidJson = true;
    } catch (e) {
      console.log(`   JSON inválido: ${e.message}`);
    }
    console.log(`   JSON válido: ${isValidJson ? '✅' : '❌'}`);
    
    if (responseData) {
      const hasExpectedFields = responseData.success !== undefined || responseData.error !== undefined;
      console.log(`   Estrutura esperada: ${hasExpectedFields ? '✅' : '❌'}`);
    }
    
    return {
      endpoint: '/api/reservas (POST)',
      statusCode: response.statusCode,
      isJson,
      isValidJson,
      passed: isValidStatus && isJson && isValidJson
    };
    
  } catch (error) {
    console.log(`   Erro: ${error.message} ❌`);
    return {
      endpoint: '/api/reservas (POST)',
      error: error.message,
      passed: false
    };
  }
}

// Função principal
async function runTests() {
  console.log('🚀 Iniciando testes de produção...');
  console.log(`📍 URL base: ${BASE_URL}`);
  
  const results = [];
  
  // Testa endpoints GET
  for (const endpoint of API_ENDPOINTS) {
    const result = await testApiJsonResponse(endpoint);
    results.push(result);
  }
  
  // Testa POST específico
  const postResult = await testReservasPost();
  results.push(postResult);
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${result.endpoint}: ${status}`);
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`Resultados: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 Todos os testes passaram! As correções estão funcionando.');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique as configurações.');
    process.exit(1);
  }
}

// Executa os testes
runTests().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
}); 