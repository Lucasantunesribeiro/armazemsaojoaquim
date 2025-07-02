#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🎨 Geração de ícones PWA - Modo Fallback (sem Sharp)\n')

// Script de fallback que cria ícones básicos sem Sharp
// Útil quando Sharp não está disponível no ambiente de build

function createBasicIcons() {
  const publicDir = path.join(process.cwd(), 'public')
  
  // Verificar se já existem ícones
  const iconsToCheck = [
    'favicon.ico',
    'apple-touch-icon.png',
    'pwa-192x192.png',
    'pwa-512x512.png'
  ]
  
  const existingIcons = iconsToCheck.filter(icon => 
    fs.existsSync(path.join(publicDir, icon))
  )
  
  if (existingIcons.length === iconsToCheck.length) {
    console.log('✅ Todos os ícones necessários já existem')
    console.log('   Ícones encontrados:', existingIcons.join(', '))
    return true
  }
  
  console.log('ℹ️  Alguns ícones estão faltando:', 
    iconsToCheck.filter(icon => !existingIcons.includes(icon)).join(', ')
  )
  
  // Verificar se existe favicon.svg para usar como base
  const faviconSvg = path.join(publicDir, 'favicon.svg')
  if (fs.existsSync(faviconSvg)) {
    console.log('✅ favicon.svg encontrado')
    console.log('ℹ️  Você pode usar ferramentas online para gerar ícones:')
    console.log('   • https://realfavicongenerator.net/')
    console.log('   • https://favicon.io/')
    console.log('   • https://www.pwa-icon-generator.com/')
  }
  
  // Criar manifest.json básico se não existir
  const manifestPath = path.join(publicDir, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    const basicManifest = {
      name: "Armazém São Joaquim",
      short_name: "Armazém SJ",
      description: "Restaurante tradicional em Santa Teresa - Rio de Janeiro",
      start_url: "/",
      display: "standalone",
      background_color: "#FFFFFF",
      theme_color: "#8B4513",
      orientation: "portrait",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    }
    
    try {
      fs.writeFileSync(manifestPath, JSON.stringify(basicManifest, null, 2))
      console.log('✅ manifest.json básico criado')
    } catch (error) {
      console.warn('⚠️  Não foi possível criar manifest.json:', error.message)
    }
  }
  
  // Criar browserconfig.xml básico se não existir
  const browserconfigPath = path.join(publicDir, 'browserconfig.xml')
  if (!fs.existsSync(browserconfigPath)) {
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>#8B4513</TileColor>
        </tile>
    </msapplication>
</browserconfig>`
    
    try {
      fs.writeFileSync(browserconfigPath, browserconfig)
      console.log('✅ browserconfig.xml básico criado')
    } catch (error) {
      console.warn('⚠️  Não foi possível criar browserconfig.xml:', error.message)
    }
  }
  
  console.log('\n💡 Dicas para produção:')
  console.log('   • Gere ícones PWA completos usando ferramentas online')
  console.log('   • Adicione Sharp como dependência para geração automática')
  console.log('   • Teste ícones em diferentes dispositivos')
  console.log('   • Valide manifest.json usando Chrome DevTools')
  
  return false
}

// Executar
try {
  const success = createBasicIcons()
  if (success) {
    console.log('\n🎉 Ícones verificados com sucesso!')
  } else {
    console.log('\n⚠️  Algumas configurações básicas foram criadas')
    console.log('   Recomenda-se gerar ícones completos para produção')
  }
} catch (error) {
  console.error('❌ Erro no script de fallback:', error.message)
  console.log('ℹ️  Continuando sem verificação de ícones...')
} 