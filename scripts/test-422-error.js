require('dotenv').config();
const http = require('http');

console.log('🚨 DIAGNÓSTICO DO ERRO 422 - ARMAZÉM SÃO JOAQUIM');
console.log('===============================================');

// Configurações para teste
const BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
  reservas: '/api/reservas',
  confirm: '/api/reservas/confirm'
};

// Dados de teste válidos
const validReservationData = {
  user_id: 'test-user-' + Date.now(),
  nome: 'João Silva',
  email: 'test@example.com',
  telefone: '(11) 99999-9999',
  data: '2024-01-20',
  horario: '19:30',
  pessoas: 4,
  observacoes: 'Teste de reserva'
};

// Dados de teste inválidos que podem causar 422
const invalidTestCases = [
  {
    name: '📋 Teste 1: Campos obrigatórios faltando',
    data: {
      nome: 'João Silva',
      email: 'test@example.com'
      // faltando user_id, telefone, data, horario, pessoas
    }
  },
  {
    name: '📋 Teste 2: Email inválido',
    data: {
      ...validReservationData,
      email: 'email-invalido'
    }
  },
  {
    name: '📋 Teste 3: Data no formato incorreto',
    data: {
      ...validReservationData,
      data: '20/01/2024' // formato brasileiro em vez de YYYY-MM-DD
    }
  },
  {
    name: '📋 Teste 4: Horário no formato incorreto',
    data: {
      ...validReservationData,
      horario: '7:30 PM' // formato AM/PM em vez de HH:MM
    }
  },
  {
    name: '📋 Teste 5: Número de pessoas inválido',
    data: {
      ...validReservationData,
      pessoas: 0 // menor que 1
    }
  },
  {
    name: '📋 Teste 6: Data no passado',
    data: {
      ...validReservationData,
      data: '2020-01-01' // data no passado
    }
  }
];

// Função para fazer requisições HTTP usando módulos nativos
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            body: body
          };
          
          // Tentar parsear JSON
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            try {
              responseData.json = JSON.parse(body);
            } catch (parseError) {
              responseData.parseError = parseError.message;
            }
          }
          
          resolve(responseData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Enviar dados se for POST
    if (data && method === 'POST') {
      const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
      req.write(jsonData);
    }

    req.end();
  });
}

async function testEndpoint(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔍 Testando: ${method} ${endpoint}`);
    
    const response = await makeRequest(endpoint, method, data);
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers['content-type']}`);

    if (response.status === 422) {
      console.log('🚨 ERRO 422 ENCONTRADO!');
      
      if (response.json) {
        console.log('📄 Resposta do servidor:', JSON.stringify(response.json, null, 2));
      } else {
        console.log('📄 Resposta como texto:', response.body.substring(0, 200) + '...');
        if (response.parseError) {
          console.log('❌ Erro de parse JSON:', response.parseError);
        }
      }
      return { status: 422, error: true, response };
    } else if (response.status >= 400) {
      console.log(`❌ Erro ${response.status}`);
      
      if (response.json) {
        console.log('📄 Erro:', JSON.stringify(response.json, null, 2));
      } else {
        console.log('📄 Resposta:', response.body.substring(0, 200) + '...');
      }
      return { status: response.status, error: true, response };
    } else {
      console.log('✅ Sucesso!');
      
      if (response.json) {
        console.log('📄 Resposta:', JSON.stringify(response.json, null, 2).substring(0, 300) + '...');
      } else {
        console.log('📄 Resposta não-JSON recebida');
      }
      return { status: response.status, success: true, response };
    }
  } catch (error) {
    console.log(`❌ Erro de rede: ${error.message}`);
    return { networkError: true, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('\n🏥 INICIANDO DIAGNÓSTICOS...\n');

  // 1. Testar se o servidor está rodando
  console.log('1️⃣ VERIFICANDO SERVIDOR');
  console.log('========================');
  
  const serverTest = await testEndpoint('/api/health');
  if (serverTest.networkError) {
    console.log('❌ Servidor não está acessível. Verifique se está rodando em http://localhost:3000');
    return;
  }

  // 2. Testar endpoint de reservas com dados válidos
  console.log('\n2️⃣ TESTANDO DADOS VÁLIDOS');
  console.log('===========================');
  
  const validTest = await testEndpoint(API_ENDPOINTS.reservas, 'POST', validReservationData);
  
  // 3. Testar casos que podem causar 422
  console.log('\n3️⃣ TESTANDO CASOS QUE CAUSAM 422');
  console.log('=================================');
  
  let found422 = false;
  
  for (const testCase of invalidTestCases) {
    console.log(`\n${testCase.name}`);
    console.log('-'.repeat(testCase.name.length));
    
    const result = await testEndpoint(API_ENDPOINTS.reservas, 'POST', testCase.data);
    
    if (result.status === 422) {
      found422 = true;
      console.log('🎯 ESTE CASO REPRODUZ O ERRO 422!');
    }
  }

  // 4. Testar endpoint de confirmação
  console.log('\n4️⃣ TESTANDO ENDPOINT DE CONFIRMAÇÃO');
  console.log('====================================');
  
  await testEndpoint(API_ENDPOINTS.confirm + '?token=invalid-token');

  // 5. Verificar se EmailJS está carregado
  console.log('\n5️⃣ VERIFICANDO EMAILJS');
  console.log('========================');
  
  try {
    // Verificar se o arquivo existe
    const fs = require('fs');
    const path = require('path');
    const emailjsPath = path.join(__dirname, '../lib/emailjs-service.ts');
    
    if (fs.existsSync(emailjsPath)) {
      console.log('✅ Arquivo EmailJS encontrado');
    } else {
      console.log('❌ Arquivo EmailJS não encontrado');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar EmailJS:', error.message);
  }

  // Resumo
  console.log('\n📊 RESUMO DO DIAGNÓSTICO');
  console.log('=========================');
  
  if (found422) {
    console.log('🚨 Erro 422 reproduzido com sucesso!');
    console.log('💡 Verifique os logs acima para identificar a causa específica.');
  } else {
    console.log('❓ Erro 422 não foi reproduzido nos testes.');
    console.log('💡 O erro pode estar ocorrendo em condições específicas do frontend.');
  }

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. 🌐 Abra o navegador em http://localhost:3000/reservas');
  console.log('2. 🔍 Abra as DevTools (F12) > Aba Network');
  console.log('3. 📝 Tente criar uma reserva');
  console.log('4. 🚨 Identifique qual requisição retorna 422');
  console.log('5. 📋 Veja os detalhes da requisição e resposta');
  
  console.log('\n🎯 TESTE MANUAL CURL:');
  console.log('curl -X POST http://localhost:3000/api/reservas \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"nome":"Test","email":"invalid"}\' \\');
  console.log('  -v');
}

// Executar diagnósticos
runDiagnostics().catch(error => {
  console.error('❌ Erro durante diagnóstico:', error);
}); 