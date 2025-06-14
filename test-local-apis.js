#!/usr/bin/env node

const http = require('http');

// Configuração dos testes
const BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = [
  '/api/health',
  '/api/test-simple', 
  '/api/reservas'
];

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LocalTest/1.0'
      }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    const req = http.request(url, requestOptions, (res) => {
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
    let responseData = null;
    try {
      responseData = JSON.parse(response.body);
      isValidJson = true;
      console.log(`   Dados: ${JSON.stringify(responseData).substring(0, 100)}...`);
    } catch (e) {
      console.log(`   JSON inválido: ${e.message}`);
      console.log(`   Resposta: ${response.body.substring(0, 200)}`);
    }
    console.log(`   JSON válido: ${isValidJson ? '✅' : '❌'}`);
    
    return {
      endpoint,
      statusCode: response.statusCode,
      isJson,
      isValidJson,
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

// Função principal
async function runTests() {
  console.log('🧪 Testando APIs localmente...');
  console.log(`📍 URL base: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  // Verificar se o servidor está rodando
  try {
    await makeRequest(`${BASE_URL}/api/health`);
  } catch (error) {
    console.error('❌ Servidor não está rodando!');
    console.log('💡 Execute: npm run dev');
    process.exit(1);
  }
  
  const results = [];
  
  // Testa endpoints GET
  for (const endpoint of API_ENDPOINTS) {
    const result = await testApiJsonResponse(endpoint);
    results.push(result);
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${result.endpoint.padEnd(20)}: ${status}`);
    if (result.error) {
      console.log(`   └─ Erro: ${result.error}`);
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`📈 Resultados: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 Todas as APIs estão funcionando localmente!');
    console.log('✅ Pronto para deploy');
    process.exit(0);
  } else {
    console.log('⚠️  Algumas APIs falharam. Corrija antes do deploy.');
    process.exit(1);
  }
}

// Executa os testes
runTests().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 