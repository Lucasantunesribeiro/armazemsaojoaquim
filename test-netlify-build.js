#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando build para deploy no Netlify...\n');

// Verificar se .next existe
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.error('❌ Diretório .next não encontrado! Execute npm run build primeiro.');
  process.exit(1);
}

console.log('✅ Diretório .next encontrado');

// Verificar arquivos essenciais
const essentialFiles = [
  '.next/BUILD_ID',
  '.next/routes-manifest.json',
  '.next/prerender-manifest.json',
  '.next/required-server-files.json'
];

let allFilesExist = true;
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} encontrado`);
  } else {
    console.log(`❌ ${file} não encontrado`);
    allFilesExist = false;
  }
});

// Verificar se temos API routes
const serverDir = path.join(nextDir, 'server', 'app');
if (fs.existsSync(serverDir)) {
  console.log('✅ Diretório de API routes encontrado');
  
  // Listar API routes
  const apiDir = path.join(serverDir, 'api');
  if (fs.existsSync(apiDir)) {
    const apiRoutes = fs.readdirSync(apiDir, { recursive: true })
      .filter(file => file.endsWith('.js'));
    
    console.log(`✅ ${apiRoutes.length} API routes encontradas:`);
    apiRoutes.forEach(route => {
      console.log(`   - /api/${route.replace('.js', '')}`);
    });
  }
} else {
  console.log('⚠️ Diretório de API routes não encontrado');
}

// Verificar configuração
const nextConfig = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfig)) {
  const config = fs.readFileSync(nextConfig, 'utf8');
  if (config.includes('output: \'export\'')) {
    console.log('❌ ERRO: next.config.js ainda tem output: "export" - isso impedirá API routes!');
    allFilesExist = false;
  } else {
    console.log('✅ next.config.js configurado corretamente (sem static export)');
  }
}

// Verificar netlify.toml
const netlifyConfig = path.join(process.cwd(), 'netlify.toml');
if (fs.existsSync(netlifyConfig)) {
  const config = fs.readFileSync(netlifyConfig, 'utf8');
  if (config.includes('publish = ".next"')) {
    console.log('✅ netlify.toml configurado para publicar .next');
  } else if (config.includes('publish = "out"')) {
    console.log('❌ ERRO: netlify.toml ainda está configurado para "out" - deve ser ".next"');
    allFilesExist = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 Build está pronto para deploy no Netlify!');
  console.log('📝 Próximos passos:');
  console.log('   1. Commit e push das mudanças');
  console.log('   2. Deploy no Netlify');
  console.log('   3. Testar API routes em produção');
  process.exit(0);
} else {
  console.log('❌ Build tem problemas que precisam ser corrigidos antes do deploy.');
  process.exit(1);
} 