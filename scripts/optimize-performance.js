#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

console.log('🚀 Iniciando otimização de performance...\n')

// Função para verificar se um comando existe
function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' })
    return true
  } catch {
    try {
      execSync(`which ${command}`, { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }
}

// Função para otimizar imagens
function optimizeImages() {
  console.log('📸 Otimizando imagens...')
  
  const imageDir = path.join(__dirname, '../public/images')
  
  if (!fs.existsSync(imageDir)) {
    console.log('❌ Diretório de imagens não encontrado')
    return
  }

  // Verificar se imagemin está disponível
  if (!commandExists('npx')) {
    console.log('❌ NPX não encontrado. Pulando otimização de imagens.')
    return
  }

  try {
    // Instalar imagemin se não estiver instalado
    console.log('📦 Verificando dependências...')
    
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
    
    if (!packageJson.devDependencies?.['imagemin'] && !packageJson.dependencies?.['imagemin']) {
      console.log('📦 Instalando imagemin...')
      execSync('npm install --save-dev imagemin imagemin-mozjpeg imagemin-pngquant imagemin-webp', { stdio: 'inherit' })
    }

    // Script de otimização de imagens
    const optimizeScript = `
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const path = require('path');

(async () => {
  console.log('🔄 Processando imagens...');
  
  // Otimizar JPEGs
  await imagemin(['public/images/*.jpg'], {
    destination: 'public/images/optimized',
    plugins: [
      imageminMozjpeg({ quality: 85 })
    ]
  });
  
  // Otimizar PNGs
  await imagemin(['public/images/*.png'], {
    destination: 'public/images/optimized',
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8] })
    ]
  });
  
  // Gerar versões WebP
  await imagemin(['public/images/*.{jpg,png}'], {
    destination: 'public/images/webp',
    plugins: [
      imageminWebp({ quality: 80 })
    ]
  });
  
  console.log('✅ Imagens otimizadas com sucesso!');
})();
`

    fs.writeFileSync('/tmp/optimize-images.js', optimizeScript)
    execSync('node /tmp/optimize-images.js', { stdio: 'inherit' })
    fs.unlinkSync('/tmp/optimize-images.js')
    
  } catch (error) {
    console.log('⚠️ Erro na otimização de imagens:', error.message)
    console.log('💡 Continuando sem otimização de imagens...')
  }
}

// Função para gerar placeholders de imagem
function generateImagePlaceholders() {
  console.log('🖼️ Gerando placeholders de imagem...')
  
  try {
    const placeholderPath = path.join(__dirname, '../public/images/placeholder.jpg')
    
    if (!fs.existsSync(placeholderPath)) {
      // Criar um placeholder simples usando base64
      const placeholderBase64 = 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle" dy=".3em">
            Armazém São Joaquim
          </text>
          <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">
            Imagem não disponível
          </text>
        </svg>
      `).toString('base64')
      
      console.log('✅ Placeholder base64 gerado')
    }
    
    console.log('✅ Placeholders verificados')
    
  } catch (error) {
    console.log('⚠️ Erro ao gerar placeholders:', error.message)
  }
}

// Função para verificar performance
function checkPerformance() {
  console.log('⚡ Verificando configurações de performance...')
  
  const nextConfigPath = path.join(__dirname, '../next.config.js')
  
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8')
    
    const checks = [
      { name: 'Compressão', check: nextConfig.includes('compress') },
      { name: 'Otimização de imagens', check: nextConfig.includes('images') },
      { name: 'Experimental features', check: nextConfig.includes('experimental') },
      { name: 'Headers de cache', check: nextConfig.includes('headers') }
    ]
    
    console.log('\n📋 Status das otimizações:')
    checks.forEach(({ name, check }) => {
      console.log(`${check ? '✅' : '❌'} ${name}`)
    })
    
  } else {
    console.log('❌ next.config.js não encontrado')
  }
}

// Função para criar service worker básico
function createServiceWorker() {
  console.log('🔧 Verificando Service Worker...')
  
  const swPath = path.join(__dirname, '../public/sw.js')
  
  if (fs.existsSync(swPath)) {
    console.log('✅ Service Worker já existe')
    return
  }

  try {
    const serviceWorkerContent = `// Service Worker básico para cache
const CACHE_NAME = 'armazem-sao-joaquim-v1';
const urlsToCache = [
  '/',
  '/menu',
  '/reservas',
  '/blog',
  '/images/armazem-fachada-historica.jpg',
  '/images/armazem-interior-aconchegante.jpg',
  '/images/santa-teresa-vista-panoramica.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
`
    
    fs.writeFileSync(swPath, serviceWorkerContent)
    console.log('✅ Service Worker criado')
    
  } catch (error) {
    console.log('⚠️ Erro ao criar Service Worker:', error.message)
  }
}

// Função para otimizar CSS
function optimizeCSS() {
  console.log('🎨 Verificando otimizações de CSS...')
  
  const tailwindConfigPath = path.join(__dirname, '../tailwind.config.js')
  
  if (fs.existsSync(tailwindConfigPath)) {
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8')
    
    if (!tailwindConfig.includes('purge') && !tailwindConfig.includes('content')) {
      console.log('⚠️ Configuração de purge/content não encontrada no Tailwind')
      console.log('💡 Adicione a configuração de content para reduzir o CSS não utilizado')
    } else {
      console.log('✅ Configuração de purge/content encontrada')
    }
  }
}

// Função para verificar imagens
function checkImages() {
  console.log('📸 Verificando imagens...')
  
  const imageDir = path.join(__dirname, '../public/images')
  
  if (!fs.existsSync(imageDir)) {
    console.log('❌ Diretório de imagens não encontrado')
    return
  }

  const images = fs.readdirSync(imageDir).filter(file => 
    /\.(jpg|jpeg|png|webp|svg)$/i.test(file)
  )
  
  console.log(`📊 Encontradas ${images.length} imagens:`)
  images.forEach(img => {
    const imgPath = path.join(imageDir, img)
    const stats = fs.statSync(imgPath)
    const sizeKB = Math.round(stats.size / 1024)
    const status = sizeKB > 500 ? '⚠️' : '✅'
    console.log(`  ${status} ${img} (${sizeKB}KB)`)
  })
  
  const largeImages = images.filter(img => {
    const imgPath = path.join(imageDir, img)
    const stats = fs.statSync(imgPath)
    return stats.size > 500 * 1024 // > 500KB
  })
  
  if (largeImages.length > 0) {
    console.log(`\n⚠️ ${largeImages.length} imagens grandes encontradas (>500KB)`)
    console.log('💡 Considere otimizar essas imagens para melhorar a performance')
  }
}

// Função para verificar bundle size
function checkBundleSize() {
  console.log('📦 Verificando configuração do bundle...')
  
  const packageJsonPath = path.join(__dirname, '../package.json')
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    
    const heavyDeps = [
      'framer-motion',
      'recharts',
      '@supabase/supabase-js'
    ]
    
    const foundHeavyDeps = heavyDeps.filter(dep => 
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    )
    
    if (foundHeavyDeps.length > 0) {
      console.log('📊 Dependências pesadas encontradas:')
      foundHeavyDeps.forEach(dep => {
        console.log(`  📦 ${dep}`)
      })
      console.log('💡 Considere lazy loading para essas dependências')
    }
    
    if (packageJson.devDependencies?.['@next/bundle-analyzer']) {
      console.log('✅ Bundle analyzer configurado')
    } else {
      console.log('💡 Para análise detalhada: npm install --save-dev @next/bundle-analyzer')
    }
  }
}

// Função principal
async function main() {
  try {
    checkPerformance()
    generateImagePlaceholders()
    checkImages()
    createServiceWorker()
    optimizeCSS()
    checkBundleSize()
    
    console.log('\n🎉 Verificação de performance concluída!')
    console.log('\n📝 Próximos passos recomendados:')
    console.log('1. Execute "npm run build" para verificar o tamanho do bundle')
    console.log('2. Use "npm run start" para testar em produção')
    console.log('3. Execute um audit do Lighthouse para verificar melhorias')
    console.log('4. Configure CDN para assets estáticos')
    console.log('5. Implemente lazy loading para componentes pesados')
    
    console.log('\n🔧 Comandos úteis:')
    console.log('- npm run perf:check - Verificar performance completa')
    console.log('- npm run analyze - Analisar bundle size')
    console.log('- npm run lighthouse - Executar audit do Lighthouse')
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  optimizeImages,
  generateImagePlaceholders,
  checkPerformance,
  createServiceWorker,
  optimizeCSS,
  checkImages,
  checkBundleSize
} 