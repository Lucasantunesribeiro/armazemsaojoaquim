#!/usr/bin/env node

/**
 * Script para fazer upload das imagens faltantes para o Supabase Storage
 * Utiliza a API do Supabase para enviar as imagens do diretório local
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')

// Configuração do Supabase
const supabaseUrl = 'https://enolssforaepnrpfrima.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ ERRO: SUPABASE_ANON_KEY não encontrada nas variáveis de ambiente')
  console.log('💡 Adicione a chave no arquivo .env.local:')
  console.log('   SUPABASE_ANON_KEY=sua_chave_aqui')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 IDENTIFICANDO IMAGENS FALTANTES DO MENU...\n')

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
]

// Diretório local de imagens
const localImagesDir = path.join(process.cwd(), 'public/images/menu_images')

// Verificar quais imagens existem localmente
console.log('📁 VERIFICANDO IMAGENS LOCAIS:')
const existingImages = []
const missingImages = []

failingImages.forEach(imageName => {
  const localPath = path.join(localImagesDir, imageName)
  if (fs.existsSync(localPath)) {
    existingImages.push(imageName)
    console.log(`✅ ${imageName} - EXISTE LOCALMENTE`)
  } else {
    missingImages.push(imageName)
    console.log(`❌ ${imageName} - FALTANDO`)
  }
})

console.log(`\n📊 RESUMO:`)
console.log(`✅ Existem localmente: ${existingImages.length}`)
console.log(`❌ Faltando: ${missingImages.length}`)

// Função para baixar imagem
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const localPath = path.join(localImagesDir, filename)
    const file = fs.createWriteStream(localPath)
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`✅ Baixado: ${filename}`)
          resolve(true)
        })
      } else {
        console.log(`❌ Erro ${response.statusCode} para: ${filename}`)
        resolve(false)
      }
    }).on('error', (err) => {
      console.log(`❌ Erro de rede para ${filename}:`, err.message)
      resolve(false)
    })
  })
}

// Criar placeholders para imagens faltantes
console.log('\n🎨 CRIANDO PLACEHOLDERS PARA IMAGENS FALTANTES:')

missingImages.forEach(imageName => {
  const placeholderPath = path.join(localImagesDir, imageName)
  const placeholderContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#f3f4f6"/>
    <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
      ${imageName.replace('.png', '').replace(/_/g, ' ')}
    </text>
    <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
      Imagem não disponível
    </text>
  </svg>`
  
  // Criar arquivo SVG como placeholder
  const svgPath = placeholderPath.replace('.png', '.svg')
  fs.writeFileSync(svgPath, placeholderContent)
  console.log(`📄 Placeholder SVG criado: ${imageName.replace('.png', '.svg')}`)
})

console.log('\n✅ PROCESSO CONCLUÍDO!')
console.log('💡 Dica: Atualize o SafeImage para usar os placeholders SVG como fallback final.')

async function uploadImage(imageName) {
  const localPath = path.join(localImagesDir, imageName)
  
  // Verificar se o arquivo existe localmente
  if (!fs.existsSync(localPath)) {
    console.log(`⚠️  ${imageName} - Arquivo não encontrado localmente`)
    return false
  }

  try {
    // Ler o arquivo
    const fileBuffer = fs.readFileSync(localPath)
    
    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(imageName, fileBuffer, {
        contentType: 'image/png',
        upsert: true // Sobrescrever se já existir
      })

    if (error) {
      console.log(`❌ ${imageName} - Erro no upload: ${error.message}`)
      return false
    }

    console.log(`✅ ${imageName} - Upload realizado com sucesso`)
    return true
  } catch (err) {
    console.log(`❌ ${imageName} - Erro: ${err.message}`)
    return false
  }
}

async function uploadAllMissingImages() {
  console.log('🚀 Iniciando upload das imagens faltantes...\n')
  console.log(`📂 Diretório local: ${localImagesDir}`)
  console.log(`🎯 Bucket destino: menu-images`)
  console.log(`📝 Total de imagens: ${missingImages.length}\n`)

  // Verificar se o diretório existe
  if (!fs.existsSync(localImagesDir)) {
    console.error(`❌ Diretório não encontrado: ${localImagesDir}`)
    console.log('💡 Certifique-se de que as imagens estão na pasta public/images/menu_images/')
    return
  }

  let successCount = 0
  let failCount = 0

  // Upload de cada imagem
  for (const imageName of missingImages) {
    const success = await uploadImage(imageName)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    // Pequena pausa entre uploads
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n📊 RESUMO DO UPLOAD:')
  console.log(`✅ Sucessos: ${successCount}`)
  console.log(`❌ Falhas: ${failCount}`)
  console.log(`📈 Taxa de sucesso: ${((successCount / missingImages.length) * 100).toFixed(1)}%`)

  if (successCount > 0) {
    console.log('\n🎉 Upload concluído! Execute o script de verificação:')
    console.log('   node scripts/check-all-menu-images.js')
  }
}

// Executar o upload
uploadAllMissingImages().catch(console.error) 