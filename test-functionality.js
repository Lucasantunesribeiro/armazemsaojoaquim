#!/usr/bin/env node

/**
 * Script de teste das funcionalidades finalizadas
 * Testa as APIs e componentes implementados
 */

const http = require('http');
const https = require('https');

// Configuração dos testes
const BASE_URL = 'http://localhost:3000';
const tests = [];
let passed = 0;
let failed = 0;

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const httpModule = isHttps ? https : http;
    
    const req = httpModule.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// Função para registrar teste
function test(name, fn) {
  tests.push({ name, fn });
}

// Função para executar teste
async function runTest(testCase) {
  try {
    await testCase.fn();
    console.log(`✅ ${testCase.name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testCase.name}: ${error.message}`);
    failed++;
  }
}

// === TESTES DA API GALERIA ===
test('API Galeria - Retorna dados', async () => {
  const response = await makeRequest(`${BASE_URL}/api/gallery`);
  if (response.status !== 200) throw new Error(`Status ${response.status}`);
  if (!response.data.success) throw new Error('Success false');
  if (!Array.isArray(response.data.data)) throw new Error('Data não é array');
  if (response.data.data.length === 0) throw new Error('Array vazio');
});

test('API Galeria - Filtro por categoria', async () => {
  const response = await makeRequest(`${BASE_URL}/api/gallery?category=PAISAGEM`);
  if (response.status !== 200) throw new Error(`Status ${response.status}`);
  if (!response.data.success) throw new Error('Success false');
});

// === TESTES DA API POUSADA ===
test('API Pousada - Retorna quartos', async () => {
  const response = await makeRequest(`${BASE_URL}/api/pousada/rooms`);
  if (response.status !== 200) throw new Error(`Status ${response.status}`);
  if (!response.data.success) throw new Error('Success false');
  if (!Array.isArray(response.data.data)) throw new Error('Data não é array');
  if (response.data.data.length === 0) throw new Error('Array vazio');
});

test('API Pousada - Estrutura dos quartos correta', async () => {
  const response = await makeRequest(`${BASE_URL}/api/pousada/rooms`);
  const room = response.data.data[0];
  
  const requiredFields = [
    'id', 'name', 'type', 'price_refundable', 'price_non_refundable',
    'description', 'amenities', 'max_guests', 'image_url', 'available'
  ];
  
  for (const field of requiredFields) {
    if (!(field in room)) throw new Error(`Campo ${field} ausente`);
  }
  
  if (!['STANDARD', 'DELUXE', 'SUITE'].includes(room.type)) {
    throw new Error(`Tipo ${room.type} inválido`);
  }
});

test('API Pousada - Filtro por tipo', async () => {
  const response = await makeRequest(`${BASE_URL}/api/pousada/rooms?type=SUITE`);
  if (response.status !== 200) throw new Error(`Status ${response.status}`);
  if (!response.data.success) throw new Error('Success false');
  
  const suites = response.data.data.filter(room => room.type === 'SUITE');
  if (suites.length === 0) throw new Error('Nenhuma suíte encontrada');
});

// === TESTES DE INTEGRAÇÃO ===
test('Middleware i18n funciona', async () => {
  // Teste redirecionamento para locale padrão
  const response = await makeRequest(`${BASE_URL}/`);
  if (response.status !== 200 && response.status !== 302) {
    throw new Error(`Status inesperado: ${response.status}`);
  }
});

// === EXECUTAR TODOS OS TESTES ===
async function runAllTests() {
  console.log('🧪 Iniciando testes das funcionalidades...\n');
  
  for (const testCase of tests) {
    await runTest(testCase);
  }
  
  console.log('\n📊 RESULTADOS:');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📝 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram! Sistema funcionando corretamente.');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a implementação.');
    process.exit(1);
  }
}

// Verificar se o servidor está rodando
makeRequest(`${BASE_URL}/api/health`)
  .then(() => {
    console.log('🚀 Servidor detectado em localhost:3000');
    runAllTests();
  })
  .catch(() => {
    console.log('❌ Servidor não encontrado em localhost:3000');
    console.log('📝 Execute "npm run dev" antes de rodar os testes');
    process.exit(1);
  });