#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Netlify...');

// Configurar variáveis de ambiente
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.ESLINT_NO_DEV_ERRORS = 'true';
process.env.NEXT_PRIVATE_SKIP_MIDDLEWARE_VALIDATION = 'true';

try {
  // 1. Limpar cache e node_modules se necessário
  console.log('📦 Instalando dependências...');
  execSync('npm ci --prefer-offline --no-audit --no-fund', { 
    stdio: 'inherit',
    timeout: 600000 
  });

  // 2. Verificar se arquivos críticos existem
  console.log('🔍 Verificando arquivos críticos...');
  
  const criticalFiles = [
    'app/api/reservas/route.ts',
    'app/api/health/route.ts',
    'app/api/test-simple/route.ts',
    'middleware.ts',
    'next.config.js'
  ];

  for (const file of criticalFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Arquivo crítico não encontrado: ${file}`);
    }
    console.log(`   ✅ ${file}`);
  }

  // 3. Build do Next.js
  console.log('🏗️  Executando build do Next.js...');
  execSync('npm run build', { 
    stdio: 'inherit',
    timeout: 900000 
  });

  // 4. Verificar se o build foi bem-sucedido
  console.log('🔍 Verificando build...');
  
  if (!fs.existsSync('.next')) {
    throw new Error('Diretório .next não foi criado');
  }

  // 5. Verificar se as APIs foram buildadas
  const apiFiles = [
    '.next/server/app/api/reservas/route.js',
    '.next/server/app/api/health/route.js',
    '.next/server/app/api/test-simple/route.js'
  ];

  for (const file of apiFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ API buildada: ${file}`);
    } else {
      console.log(`   ⚠️  API não encontrada: ${file}`);
    }
  }

  // 6. Criar arquivo de informações do build
  const buildInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    apis: apiFiles.map(file => ({
      path: file,
      exists: fs.existsSync(file)
    }))
  };

  fs.writeFileSync('.next/build-info.json', JSON.stringify(buildInfo, null, 2));

  console.log('✅ Build concluído com sucesso!');
  console.log('📊 Informações do build salvas em .next/build-info.json');

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
} 