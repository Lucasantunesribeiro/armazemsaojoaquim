#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Função para verificar e carregar sharp de forma segura
function loadSharp() {
  try {
    return require('sharp')
  } catch (error) {
    console.warn('⚠️  Sharp não está disponível. Tentando instalar...')
    
    try {
      const { execSync } = require('child_process')
      execSync('npm install sharp', { stdio: 'inherit' })
      return require('sharp')
    } catch (installError) {
      console.error('❌ Não foi possível instalar ou carregar Sharp:', installError.message)
      console.log('ℹ️  Continuando sem geração de ícones...')
      return null
    }
  }
}

const sharp = loadSharp()

// Se sharp não estiver disponível, pular geração de ícones
if (!sharp) {
  console.log('ℹ️  Pulando geração de ícones (Sharp não disponível)')
  process.exit(0)
}

console.log('🎨 Gerando ícones PWA - Preset Minimal 2023...\n')

// Configurações baseadas no Vite PWA Assets Generator
const PWA_ICONS_CONFIG = {
  // Preset Minimal 2023 - Recomendação atual
  minimal2023: [
    // Favicon ICO (48x48 transparente)
    { size: 48, name: 'favicon.ico', format: 'ico', transparent: true },
    
    // PWA Manifest Icons
    { size: 64, name: 'pwa-64x64.png', format: 'png', transparent: true },
    { size: 192, name: 'pwa-192x192.png', format: 'png', transparent: true },
    { size: 512, name: 'pwa-512x512.png', format: 'png', transparent: true, purpose: 'any' },
    
    // Maskable Icon (fundo branco)
    { size: 512, name: 'maskable-icon-512x512.png', format: 'png', transparent: false, purpose: 'maskable' },
    
    // Apple Touch Icon (fundo branco)
    { size: 180, name: 'apple-touch-icon-180x180.png', format: 'png', transparent: false },
    { size: 180, name: 'apple-touch-icon.png', format: 'png', transparent: false }, // Alias padrão
  ],
  
  // Ícones adicionais para compatibilidade
  extended: [
    // Favicons adicionais
    { size: 16, name: 'favicon-16x16.png', format: 'png', transparent: true },
    { size: 32, name: 'favicon-32x32.png', format: 'png', transparent: true },
    
    // Ícones PWA adicionais
    { size: 72, name: 'pwa-72x72.png', format: 'png', transparent: true },
    { size: 96, name: 'pwa-96x96.png', format: 'png', transparent: true },
    { size: 128, name: 'pwa-128x128.png', format: 'png', transparent: true },
    { size: 144, name: 'pwa-144x144.png', format: 'png', transparent: true },
    { size: 152, name: 'pwa-152x152.png', format: 'png', transparent: true },
    { size: 384, name: 'pwa-384x384.png', format: 'png', transparent: true },
    
    // Splash screens para iOS
    { width: 640, height: 1136, name: 'apple-startup-640x1136.png', format: 'png', transparent: false },
    { width: 750, height: 1334, name: 'apple-startup-750x1334.png', format: 'png', transparent: false },
    { width: 1242, height: 2208, name: 'apple-startup-1242x2208.png', format: 'png', transparent: false },
    { width: 1125, height: 2436, name: 'apple-startup-1125x2436.png', format: 'png', transparent: false },
    { width: 828, height: 1792, name: 'apple-startup-828x1792.png', format: 'png', transparent: false },
    { width: 1242, height: 2688, name: 'apple-startup-1242x2688.png', format: 'png', transparent: false },
    
    // Windows tiles
    { size: 70, name: 'mstile-70x70.png', format: 'png', transparent: true },
    { size: 150, name: 'mstile-150x150.png', format: 'png', transparent: true },
    { width: 310, height: 150, name: 'mstile-310x150.png', format: 'png', transparent: true },
    { size: 310, name: 'mstile-310x310.png', format: 'png', transparent: true },
  ]
}

// Cores do tema
const THEME_COLORS = {
  primary: '#8B4513',      // Marrom do Armazém
  background: '#FFFFFF',   // Branco para fundos
  surface: '#FDF6E3',      // Bege claro
}

// Função para criar fundo colorido
const createBackground = (width, height, color = THEME_COLORS.background) => {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: color
    }
  })
}

// Função para gerar ícone com fundo
const generateIconWithBackground = async (inputPath, outputPath, size, backgroundColor) => {
  const dimension = typeof size === 'object' ? size : { width: size, height: size }
  
  try {
    // Criar fundo
    const background = await createBackground(dimension.width, dimension.height, backgroundColor)
      .png()
      .toBuffer()

    // Redimensionar ícone original
    const iconSize = Math.min(dimension.width, dimension.height) * 0.8 // 80% do tamanho
    const resizedIcon = await sharp(inputPath)
      .resize(Math.round(iconSize), Math.round(iconSize), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()

    // Compor ícone sobre o fundo
    await sharp(background)
      .composite([{
        input: resizedIcon,
        gravity: 'center'
      }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath)

    return true
  } catch (error) {
    console.error(`❌ Erro ao gerar ${outputPath}:`, error.message)
    return false
  }
}

// Função para gerar ícone transparente
const generateTransparentIcon = async (inputPath, outputPath, size, format = 'png') => {
  const dimension = typeof size === 'object' ? size : { width: size, height: size }
  
  try {
    let pipeline = sharp(inputPath)
      .resize(dimension.width, dimension.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })

    if (format === 'ico') {
      // Para ICO, usar PNG como intermediário
      const pngBuffer = await pipeline.png().toBuffer()
      
      // Usar sharp-ico se disponível, senão PNG
      try {
        const ico = require('sharp-ico')
        await ico([pngBuffer]).toFile(outputPath)
      } catch (e) {
        // Fallback para PNG se sharp-ico não estiver disponível
        await sharp(pngBuffer).png().toFile(outputPath.replace('.ico', '.png'))
        console.log(`ℹ️  ICO não disponível, gerado PNG: ${outputPath.replace('.ico', '.png')}`)
      }
    } else {
      await pipeline
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath)
    }

    return true
  } catch (error) {
    console.error(`❌ Erro ao gerar ${outputPath}:`, error.message)
    return false
  }
}

// Função para gerar splash screen
const generateSplashScreen = async (inputPath, outputPath, width, height) => {
  try {
    // Criar fundo colorido
    const background = await createBackground(width, height, THEME_COLORS.background)
      .png()
      .toBuffer()

    // Redimensionar logo para caber na tela
    const logoSize = Math.min(width, height) * 0.3 // 30% da menor dimensão
    const resizedLogo = await sharp(inputPath)
      .resize(Math.round(logoSize), Math.round(logoSize), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()

    // Compor logo sobre o fundo
    await sharp(background)
      .composite([{
        input: resizedLogo,
        gravity: 'center'
      }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath)

    return true
  } catch (error) {
    console.error(`❌ Erro ao gerar splash ${outputPath}:`, error.message)
    return false
  }
}

// Função principal
async function generatePWAIcons() {
  const sourceImage = path.join(process.cwd(), 'public', 'favicon.svg')
  const outputDir = path.join(process.cwd(), 'public')
  
  // Verificar se a imagem fonte existe
  if (!fs.existsSync(sourceImage)) {
    console.error('❌ Imagem fonte não encontrada:', sourceImage)
    console.log('💡 Certifique-se de ter um arquivo favicon.svg na pasta public/')
    process.exit(1)
  }

  // Criar diretório de saída se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log(`📁 Fonte: ${sourceImage}`)
  console.log(`📁 Destino: ${outputDir}\n`)

  let successCount = 0
  let totalCount = 0

  // Gerar ícones do preset minimal 2023
  console.log('🎯 Gerando preset minimal 2023...')
  for (const config of PWA_ICONS_CONFIG.minimal2023) {
    totalCount++
    const outputPath = path.join(outputDir, config.name)
    
    let success = false
    if (config.transparent) {
      success = await generateTransparentIcon(sourceImage, outputPath, config.size, config.format)
    } else {
      success = await generateIconWithBackground(sourceImage, outputPath, config.size, THEME_COLORS.background)
    }
    
    if (success) {
      successCount++
      console.log(`✅ ${config.name} (${config.size}x${config.size})`)
    }
  }

  // Gerar ícones estendidos (opcional)
  const generateExtended = process.argv.includes('--extended')
  if (generateExtended) {
    console.log('\n🔧 Gerando ícones estendidos...')
    for (const config of PWA_ICONS_CONFIG.extended) {
      totalCount++
      const outputPath = path.join(outputDir, config.name)
      
      let success = false
      if (config.width && config.height) {
        // Splash screen
        success = await generateSplashScreen(sourceImage, outputPath, config.width, config.height)
      } else if (config.transparent) {
        success = await generateTransparentIcon(sourceImage, outputPath, config.size, config.format)
      } else {
        success = await generateIconWithBackground(sourceImage, outputPath, config.size, THEME_COLORS.background)
      }
      
      if (success) {
        successCount++
        console.log(`✅ ${config.name}`)
      }
    }
  }

  // Gerar arquivo HTML com as tags
  const htmlTags = generateHTMLTags()
  const htmlPath = path.join(outputDir, 'pwa-icons.html')
  fs.writeFileSync(htmlPath, htmlTags)
  console.log(`\n📄 Tags HTML geradas: ${htmlPath}`)

  // Gerar manifest.json atualizado
  const manifestPath = path.join(outputDir, 'manifest.json')
  if (fs.existsSync(manifestPath)) {
    updateManifestIcons(manifestPath)
    console.log(`📱 Manifest atualizado: ${manifestPath}`)
  }

  console.log(`\n🎉 Concluído! ${successCount}/${totalCount} ícones gerados com sucesso`)
  
  if (successCount < totalCount) {
    console.log('⚠️  Alguns ícones falharam. Verifique se o Sharp está instalado corretamente.')
  }

  console.log('\n💡 Próximos passos:')
  console.log('   1. Copie as tags do arquivo pwa-icons.html para seu layout')
  console.log('   2. Verifique o manifest.json atualizado')
  console.log('   3. Teste a instalação PWA')
}

// Função para gerar tags HTML
function generateHTMLTags() {
  return `<!-- PWA Icons - Preset Minimal 2023 -->
<!-- Gerado automaticamente pelo script generate-icons.js -->

<!-- Favicons -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">

<!-- Apple Startup Images -->
<link rel="apple-touch-startup-image" href="/apple-startup-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)">
<link rel="apple-touch-startup-image" href="/apple-startup-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)">
<link rel="apple-touch-startup-image" href="/apple-startup-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)">

<!-- Windows Tiles -->
<meta name="msapplication-TileColor" content="#8B4513">
<meta name="msapplication-config" content="/browserconfig.xml">

<!-- Theme -->
<meta name="theme-color" content="#8B4513">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Armazém SJ">
`
}

// Função para atualizar manifest.json
function updateManifestIcons(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    
    // Ícones do preset minimal 2023
    manifest.icons = [
      {
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png'
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  } catch (error) {
    console.error('❌ Erro ao atualizar manifest:', error.message)
  }
}

// Verificar dependências
async function checkDependencies() {
  try {
    require.resolve('sharp')
    console.log('✅ Sharp encontrado')
  } catch (error) {
    console.error('❌ Sharp não encontrado. Instale com: npm install sharp')
    process.exit(1)
  }

  // Verificar sharp-ico (opcional)
  try {
    require.resolve('sharp-ico')
    console.log('✅ Sharp-ICO encontrado')
  } catch (error) {
    console.log('⚠️  Sharp-ICO não encontrado. ICO será convertido para PNG')
  }
}

// Executar script
if (require.main === module) {
  checkDependencies().then(() => {
    generatePWAIcons().catch(console.error)
  })
}

module.exports = { generatePWAIcons } 