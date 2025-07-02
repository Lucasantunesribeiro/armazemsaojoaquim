#!/usr/bin/env node

/**
 * Script de Validação - Armazém São Joaquim
 * Verifica se todas as configurações necessárias estão corretas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validando configuração do projeto...\n');

let errors = [];
let warnings = [];
let success = [];

// Função para verificar arquivo
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    success.push(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    errors.push(`❌ ${description} não encontrado: ${filePath}`);
    return false;
  }
}

// Função para verificar variável de ambiente
function checkEnvVar(varName, required = true, publicVar = false) {
  const value = process.env[varName];
  const prefix = publicVar ? 'NEXT_PUBLIC_' : '';
  
  if (value && value !== 'your-value-here' && value !== 'change-me') {
    success.push(`✅ ${varName}: Configurada`);
    return true;
  } else if (required) {
    errors.push(`❌ Variável obrigatória não configurada: ${varName}`);
    return false;
  } else {
    warnings.push(`⚠️  Variável opcional não configurada: ${varName}`);
    return false;
  }
}

// Função para verificar dependência
function checkDependency(packageName, description) {
  try {
    require.resolve(packageName);
    success.push(`✅ ${description}: ${packageName}`);
    return true;
  } catch (error) {
    errors.push(`❌ ${description} não instalado: ${packageName}`);
    return false;
  }
}

// 1. Verificar arquivos críticos
console.log('📁 Verificando arquivos críticos...');
checkFile('package.json', 'Package.json');
checkFile('next.config.js', 'Configuração Next.js');
checkFile('tailwind.config.js', 'Configuração Tailwind');
checkFile('postcss.config.js', 'Configuração PostCSS');
checkFile('app/api/reservas/route.ts', 'API de Reservas');
checkFile('supabase/migrations/001_create_reservations_table.sql', 'Migração de Reservas');
checkFile('env.example', 'Arquivo de exemplo de variáveis');

// 2. Verificar variáveis de ambiente
console.log('\n🔐 Verificando variáveis de ambiente...');

// Tentar carregar .env.local
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
  success.push('✅ Arquivo .env.local encontrado');
} else {
  warnings.push('⚠️  Arquivo .env.local não encontrado (OK para produção)');
}

// Variáveis obrigatórias
checkEnvVar('NEXT_PUBLIC_SUPABASE_URL', true, true);
checkEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', true, true);
checkEnvVar('NEXT_PUBLIC_SITE_URL', true, true);

// Variáveis importantes para funcionalidades
checkEnvVar('RESEND_API_KEY', true);

// Variáveis opcionais
checkEnvVar('NEXT_PUBLIC_GA_ID', false, true);
checkEnvVar('SUPABASE_SERVICE_ROLE_KEY', false);

// 3. Verificar dependências críticas
console.log('\n📦 Verificando dependências...');
checkDependency('@supabase/supabase-js', 'Supabase Client');
checkDependency('@supabase/auth-helpers-nextjs', 'Supabase Auth Helpers');
checkDependency('resend', 'Resend Email Service');
checkDependency('react', 'React');
checkDependency('next', 'Next.js');
checkDependency('tailwindcss', 'Tailwind CSS');

// 4. Verificar configurações específicas
console.log('\n⚙️  Verificando configurações...');

// Verificar se Tailwind tem plugins necessários
try {
  const tailwindConfig = require(path.join(process.cwd(), 'tailwind.config.js'));
  if (tailwindConfig.plugins && tailwindConfig.plugins.length > 0) {
    success.push('✅ Plugins do Tailwind configurados');
  } else {
    warnings.push('⚠️  Nenhum plugin do Tailwind configurado');
  }
} catch (error) {
  errors.push('❌ Erro ao verificar configuração do Tailwind');
}

// Verificar configuração do PostCSS
try {
  const postcssConfig = require(path.join(process.cwd(), 'postcss.config.js'));
  if (postcssConfig.plugins) {
    success.push('✅ PostCSS configurado corretamente');
  } else {
    errors.push('❌ PostCSS mal configurado');
  }
} catch (error) {
  errors.push('❌ Erro ao verificar configuração do PostCSS');
}

// 5. Verificar se build pode ser executado
console.log('\n🏗️  Testando build...');
try {
  // Verificar se next build pode ser executado (dry run)
  execSync('npx next info', { stdio: 'pipe' });
  success.push('✅ Next.js configurado corretamente');
} catch (error) {
  errors.push('❌ Erro na configuração do Next.js');
}

// 6. Verificar estrutura de pastas
console.log('\n📂 Verificando estrutura...');
const requiredDirs = [
  'app',
  'app/api',
  'app/api/reservas',
  'app/reservas',
  'components',
  'lib',
  'public',
  'supabase'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    success.push(`✅ Diretório encontrado: ${dir}`);
  } else {
    errors.push(`❌ Diretório não encontrado: ${dir}`);
  }
});

// 7. Verificar templates de email
console.log('\n📧 Verificando templates de email...');
checkFile('components/email-templates/ReservationConfirmation.tsx', 'Template de Confirmação');
checkFile('components/email-templates/AdminNotification.tsx', 'Template de Notificação Admin');

// 8. Verificar configuração de deployment
console.log('\n🚀 Verificando configuração de deploy...');
checkFile('netlify.toml', 'Configuração Netlify');
checkFile('scripts/netlify-build.js', 'Script de build Netlify');

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO DE VALIDAÇÃO');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ SUCESSOS:');
  success.forEach(msg => console.log(`  ${msg}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVISOS:');
  warnings.forEach(msg => console.log(`  ${msg}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERROS:');
  errors.forEach(msg => console.log(`  ${msg}`));
  
  console.log('\n🔧 AÇÕES NECESSÁRIAS:');
  console.log('  1. Corrija os erros listados acima');
  console.log('  2. Configure as variáveis de ambiente obrigatórias');
  console.log('  3. Execute novamente este script');
  console.log('  4. Consulte o arquivo SETUP.md para instruções detalhadas');
  
  process.exit(1);
} else {
  console.log('\n🎉 CONFIGURAÇÃO VÁLIDA!');
  console.log('  O projeto está pronto para ser executado em produção.');
  
  if (warnings.length > 0) {
    console.log('  Considere resolver os avisos para melhor funcionalidade.');
  }
  
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('  1. Execute: npm run build');
  console.log('  2. Teste localmente: npm run dev');
  console.log('  3. Deploy para produção');
  console.log('  4. Configure monitoramento');
  
  process.exit(0);
} 