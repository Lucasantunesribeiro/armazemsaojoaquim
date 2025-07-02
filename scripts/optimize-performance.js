#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Iniciando otimização de performance...\n')

// Configurações
const config = {
  imageDir: path.join(__dirname, '../public/images'),
  maxImageSize: 500 * 1024, // 500KB
  targetFormats: ['webp', 'avif'],
  compressionQuality: 85
}

// Função para verificar se um comando existe
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Função para obter tamanho do arquivo
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

// Função para formatar tamanho em bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Função para otimizar imagens
async function optimizeImages() {
  console.log('📸 Verificando imagens...')
  
  if (!fs.existsSync(config.imageDir)) {
    console.log('❌ Diretório de imagens não encontrado')
    return
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const files = fs.readdirSync(config.imageDir, { recursive: true })
    .filter(file => {
      const ext = path.extname(file).toLowerCase()
      return imageExtensions.includes(ext)
    })

  console.log(`📊 Encontradas ${files.length} imagens`)

  let totalSavings = 0
  let optimizedCount = 0
  const largeImages = []

  for (const file of files) {
    const filePath = path.join(config.imageDir, file)
    const fileSize = getFileSize(filePath)
    
    if (fileSize > config.maxImageSize) {
      largeImages.push({
        path: file,
        size: fileSize,
        formattedSize: formatBytes(fileSize)
      })
    }

    // Verificar se já existe versão WebP
    const baseName = path.parse(file).name
    const webpPath = path.join(config.imageDir, `${baseName}.webp`)
    
    if (!fs.existsSync(webpPath) && !file.endsWith('.webp')) {
      // Criar versão WebP se possível
      if (commandExists('cwebp')) {
        try {
          execSync(`cwebp -q ${config.compressionQuality} "${filePath}" -o "${webpPath}"`, { stdio: 'ignore' })
          const webpSize = getFileSize(webpPath)
          const savings = fileSize - webpSize
          if (savings > 0) {
            totalSavings += savings
            optimizedCount++
            console.log(`✅ ${file} → ${baseName}.webp (${formatBytes(savings)} economizados)`)
          }
        } catch (error) {
          console.log(`⚠️  Erro ao otimizar ${file}`)
        }
      }
    }
  }

  if (largeImages.length > 0) {
    console.log('\n⚠️  Imagens grandes encontradas (>500KB):')
    largeImages.forEach(img => {
      console.log(`   ${img.path} - ${img.formattedSize}`)
    })
  }

  console.log(`\n📈 Resumo da otimização:`)
  console.log(`   Imagens otimizadas: ${optimizedCount}`)
  console.log(`   Economia total: ${formatBytes(totalSavings)}`)
  
  if (!commandExists('cwebp')) {
    console.log('\n💡 Dica: Instale webp-tools para otimização automática:')
    console.log('   sudo apt-get install webp (Ubuntu/Debian)')
    console.log('   brew install webp (macOS)')
  }
}

// Função para verificar bundle size
function analyzeBundleSize() {
  console.log('\n📦 Analisando tamanho do bundle...')
  
  const nextDir = path.join(__dirname, '../.next')
  if (!fs.existsSync(nextDir)) {
    console.log('❌ Build não encontrado. Execute "npm run build" primeiro.')
    return
  }

  try {
    // Verificar tamanho dos chunks principais
    const staticDir = path.join(nextDir, 'static')
    if (fs.existsSync(staticDir)) {
      const chunks = []
      
      function scanDirectory(dir, prefix = '') {
        const items = fs.readdirSync(dir)
        for (const item of items) {
          const itemPath = path.join(dir, item)
          const stat = fs.statSync(itemPath)
          
          if (stat.isDirectory()) {
            scanDirectory(itemPath, `${prefix}${item}/`)
          } else if (item.endsWith('.js')) {
            chunks.push({
              name: `${prefix}${item}`,
              size: stat.size,
              formattedSize: formatBytes(stat.size)
            })
          }
        }
      }
      
      scanDirectory(staticDir)
      
      // Ordenar por tamanho
      chunks.sort((a, b) => b.size - a.size)
      
      console.log('📊 Top 10 maiores chunks JavaScript:')
      chunks.slice(0, 10).forEach((chunk, index) => {
        console.log(`   ${index + 1}. ${chunk.name} - ${chunk.formattedSize}`)
      })
      
      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
      console.log(`\n📈 Tamanho total do JavaScript: ${formatBytes(totalSize)}`)
    }
  } catch (error) {
    console.log('❌ Erro ao analisar bundle:', error.message)
  }
}

// Função para verificar configurações de performance
function checkPerformanceConfig() {
  console.log('\n⚙️  Verificando configurações de performance...')
  
  const checks = [
    {
      name: 'next.config.js otimizado',
      check: () => {
        const configPath = path.join(__dirname, '../next.config.js')
        if (!fs.existsSync(configPath)) return false
        const config = fs.readFileSync(configPath, 'utf8')
        return config.includes('swcMinify') && config.includes('optimizeCss')
      }
    },
    {
      name: 'Compressão habilitada',
      check: () => {
        const configPath = path.join(__dirname, '../next.config.js')
        if (!fs.existsSync(configPath)) return false
        const config = fs.readFileSync(configPath, 'utf8')
        return config.includes('compress: true')
      }
    },
    {
      name: 'Headers de cache configurados',
      check: () => {
        const configPath = path.join(__dirname, '../next.config.js')
        if (!fs.existsSync(configPath)) return false
        const config = fs.readFileSync(configPath, 'utf8')
        return config.includes('Cache-Control')
      }
    },
    {
      name: 'Otimização de imagens configurada',
      check: () => {
        const configPath = path.join(__dirname, '../next.config.js')
        if (!fs.existsSync(configPath)) return false
        const config = fs.readFileSync(configPath, 'utf8')
        return config.includes('formats:') && config.includes('webp')
      }
    }
  ]

  checks.forEach(check => {
    const status = check.check() ? '✅' : '❌'
    console.log(`   ${status} ${check.name}`)
  })
}

// Função para gerar recomendações
function generateRecommendations() {
  console.log('\n💡 Recomendações de performance:')
  
  const recommendations = [
    '1. Use OptimizedImage em vez de <img> tags',
    '2. Implemente lazy loading para imagens below-the-fold',
    '3. Minimize o uso de useEffect desnecessários',
    '4. Use React.memo para componentes que não mudam frequentemente',
    '5. Implemente code splitting para rotas',
    '6. Use dynamic imports para componentes pesados',
    '7. Otimize fontes com font-display: swap',
    '8. Minimize o JavaScript não utilizado',
    '9. Use service workers para cache',
    '10. Implemente preloading para recursos críticos'
  ]

  recommendations.forEach(rec => console.log(`   ${rec}`))
}

// Função principal
async function main() {
  try {
    await optimizeImages()
    analyzeBundleSize()
    checkPerformanceConfig()
    generateRecommendations()
    
    console.log('\n🎉 Otimização de performance concluída!')
    console.log('\n📋 Próximos passos:')
    console.log('   1. Execute "npm run build" para aplicar otimizações')
    console.log('   2. Teste com "npm run lighthouse" para verificar melhorias')
    console.log('   3. Deploy e monitore as métricas Core Web Vitals')
    
  } catch (error) {
    console.error('❌ Erro durante otimização:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  optimizeImages,
  analyzeBundleSize,
  checkPerformanceConfig,
  generateRecommendations
} 