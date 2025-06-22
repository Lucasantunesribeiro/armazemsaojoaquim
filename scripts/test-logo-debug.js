const fs = require('fs');
const path = require('path');

console.log('🔍 TESTANDO CARREGAMENTO DO LOGO...\n');

// Verificar se os arquivos existem
const logoFiles = [
  'public/images/logo.jpg',
  'public/images/logo.webp',
  'public/images/logo.avif',
  'public/images/logo-optimized.jpg',
  'public/images/placeholder.svg',
  'public/images/placeholder.jpg'
];

console.log('📁 VERIFICANDO ARQUIVOS DE LOGO:');
logoFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`❌ ${file} - NÃO ENCONTRADO`);
  }
});

// Verificar se o logo principal tem conteúdo válido
const logoPath = path.join(process.cwd(), 'public/images/logo.jpg');
if (fs.existsSync(logoPath)) {
  const stats = fs.statSync(logoPath);
  console.log('\n📊 DETALHES DO LOGO PRINCIPAL:');
  console.log(`📄 Arquivo: ${logoPath}`);
  console.log(`📏 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`📅 Modificado: ${stats.mtime.toISOString()}`);
  
  // Verificar se o arquivo não está vazio ou corrompido
  if (stats.size < 100) {
    console.log('⚠️  AVISO: Arquivo muito pequeno, pode estar corrompido!');
  }
  
  if (stats.size > 5 * 1024 * 1024) {
    console.log('⚠️  AVISO: Arquivo muito grande, pode afetar performance!');
  }
} else {
  console.log('\n❌ LOGO PRINCIPAL NÃO ENCONTRADO!');
}

console.log('\n🔧 SUGESTÕES DE CORREÇÃO:');
console.log('1. Verificar se o arquivo logo.jpg não está corrompido');
console.log('2. Reiniciar o servidor de desenvolvimento');
console.log('3. Limpar cache do Next.js: rm -rf .next');
console.log('4. Verificar se há conflitos de CSS');
console.log('5. Verificar console do navegador para erros 404');