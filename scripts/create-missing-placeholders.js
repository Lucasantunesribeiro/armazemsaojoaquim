const fs = require('fs');
const path = require('path');

console.log('🎨 CRIANDO PLACEHOLDERS PARA IMAGENS FALTANTES...\n');

// Imagens que estão falhando baseadas nos erros do console
const failingImages = [
  'ceviche_carioca.png',
  'feijoada_da_casa_individual.png', 
  'feijoada_da_casa_para_dois.png',
  'marquise_au_chocolat.png',
  'farofa.png',
  'pure_de_batata.png',
  'patatas_brava.png',
  'legumes_na_brasa.png',
  'linguica_na_brasa.png',
  'pasteis_de_pupunha.png',
  'vinagrete_de_polvo.png',
  'mix_vegetariano.png',
  'envelopado_de_acelga.png',
  'patatas_bravas.png',
  'bife_a_milanesa.png',
  'feijoada_da_casa_buffet.png',
  'sobrecoxa_ao_carvao.png',
  'hamburguer_vegetariano.png'
];

// Diretório local de imagens
const localImagesDir = path.join(process.cwd(), 'public/images/menu_images');

// Verificar se o diretório existe
if (!fs.existsSync(localImagesDir)) {
  fs.mkdirSync(localImagesDir, { recursive: true });
  console.log('📁 Diretório criado:', localImagesDir);
}

console.log('📁 VERIFICANDO IMAGENS LOCAIS:');
const existingImages = [];
const missingImages = [];

failingImages.forEach(imageName => {
  const localPath = path.join(localImagesDir, imageName);
  if (fs.existsSync(localPath)) {
    existingImages.push(imageName);
    console.log(`✅ ${imageName} - EXISTE LOCALMENTE`);
  } else {
    missingImages.push(imageName);
    console.log(`❌ ${imageName} - FALTANDO`);
  }
});

console.log(`\n📊 RESUMO:`);
console.log(`✅ Existem localmente: ${existingImages.length}`);
console.log(`❌ Faltando: ${missingImages.length}`);

// Função para criar nome amigável
function createFriendlyName(filename) {
  return filename
    .replace('.png', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Criar placeholders SVG para imagens faltantes
console.log('\n🎨 CRIANDO PLACEHOLDERS SVG:');

missingImages.forEach(imageName => {
  const friendlyName = createFriendlyName(imageName);
  const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="200" cy="120" r="30" fill="#94a3b8" opacity="0.5"/>
  <rect x="170" y="95" width="60" height="50" rx="8" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.5"/>
  <path d="M180 110 L190 120 L210 100" stroke="#94a3b8" stroke-width="3" fill="none" opacity="0.5"/>
  <text x="200" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#475569">
    ${friendlyName}
  </text>
  <text x="200" y="200" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b">
    Imagem não disponível
  </text>
  <text x="200" y="220" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#94a3b8">
    Armazém São Joaquim
  </text>
</svg>`;
  
  // Salvar como arquivo SVG
  const svgPath = path.join(localImagesDir, imageName.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`📄 Placeholder SVG criado: ${imageName.replace('.png', '.svg')}`);
  
  // Também criar uma versão PNG usando um placeholder simples
  const pngPlaceholderPath = path.join(localImagesDir, imageName);
  
  // Criar um arquivo de placeholder temporário (será substituído pelo componente)
  const placeholderData = {
    name: friendlyName,
    filename: imageName,
    created: new Date().toISOString()
  };
  
  fs.writeFileSync(pngPlaceholderPath + '.placeholder', JSON.stringify(placeholderData, null, 2));
  console.log(`📝 Metadata criada: ${imageName}.placeholder`);
});

console.log('\n✅ PLACEHOLDERS CRIADOS COM SUCESSO!');
console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Atualize o SafeImage para usar os placeholders SVG');
console.log('2. Teste o sistema de fallback');
console.log('3. Faça deploy para verificar se resolve o problema'); 