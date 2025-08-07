#!/usr/bin/env node

/**
 * TESTE RÁPIDO DA CORREÇÃO DE AUTENTICAÇÃO ADMIN
 * Simula requisição com Authorization header
 */

const http = require('http');

const testEndpoint = async () => {
  console.log('🧪 Testando endpoint /api/admin/dashboard/stats');
  console.log('📍 URL: http://localhost:3000/api/admin/dashboard/stats');
  console.log('🔑 Method: GET com Authorization header simulado');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/dashboard/stats',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer fake-token-for-testing'
    },
    timeout: 5000
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('✅ Response:', JSON.stringify(parsedData, null, 2));
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          console.log('📄 Raw Response:', data);
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('⏰ Request Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Testar apenas se processo não estiver rodando
const testConnection = async () => {
  try {
    const result = await testEndpoint();
    
    console.log('\n📋 ANÁLISE:');
    
    if (result.status === 200) {
      console.log('✅ Status 200 - Endpoint funcionando!');
    } else if (result.status === 401) {
      console.log('⚠️  Status 401 - Auth required (esperado sem token válido)');
    } else if (result.status === 403) {
      console.log('❌ Status 403 - Access denied (problema de middleware)');
    } else if (result.status === 500) {
      console.log('💥 Status 500 - Internal error (problema crítico)');
    } else {
      console.log(`❓ Status ${result.status} - Inesperado`);
    }
    
    if (result.data && result.data.debug) {
      console.log('🔍 Debug Info:', result.data.debug);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('📴 Servidor não está rodando em localhost:3000');
      console.log('💡 Execute: npm run dev');
    } else {
      console.error('❌ Erro no teste:', error.message);
    }
  }
};

if (require.main === module) {
  console.log('🚀 TESTE RÁPIDO DA CORREÇÃO ADMIN AUTH');
  console.log('=' .repeat(50));
  testConnection();
}

module.exports = { testEndpoint };