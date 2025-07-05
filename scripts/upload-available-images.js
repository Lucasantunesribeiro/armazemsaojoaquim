#!/usr/bin/env node

/**
 * Script para fazer upload das imagens disponíveis localmente para o Supabase Storage
 * Compara as imagens locais com as faltantes e faz upload das disponíveis
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Analisando imagens disponíveis para upload...\n')

// Lista das imagens faltantes no Supabase
const missingImages = [
  'caesar_salad_com_fatias_de_frango.png',
  'caesar_salad_sem_fatias_de_frango.png',
  'picanha_ao_carvao_2_pessoas.png',
  'saladinha_da_casa.png',
  'marquise_au_chocolat.png',
  'linguica_na_brasa.png',
  'vinagrete_de_polvo.png',
  'patatas_brava.png',
  'mix_vegetariano.png',
  'sobrecoxa_ao_carvao_1_pessoa.png',
  'legumes_na_brasa.png',
  'envelopado_de_acelga.png',
  'farofa.png',
  'feijoada_da_casa_individual.png',
  'pasteis_de_pupunha.png',
  'patatas_bravas.png',
  'feijoada_da_casa_para_dois.png',
  'feijoada_da_casa_buffet.png',
  'ceviche_carioca.png',
  'pure_de_batata.png',
  'hamburguer_vegetariano.png',
  'bife_a_milanesa.png'
]

// Diretório das imagens locais
const localImagesDir = path.join(__dirname, '..', 'public', 'images', 'menu_images')

// Verificar quais imagens faltantes estão disponíveis localmente
console.log(`📂 Verificando diretório: ${localImagesDir}\n`)

if (!fs.existsSync(localImagesDir)) {
  console.error(`❌ Diretório não encontrado: ${localImagesDir}`)
  process.exit(1)
}

const localFiles = fs.readdirSync(localImagesDir)
const availableForUpload = []
const notAvailableLocally = []

// Mapear nomes alternativos para alguns arquivos
const nameMapping = {
  'caesar_salad_com_fatias_de_frango.png': 'caesar_salad_com_frango.png',
  'caesar_salad_sem_fatias_de_frango.png': 'caesar_salad_sem_frango.png',
  'picanha_ao_carvao_2_pessoas.png': 'picanha_ao_carvao.png',
  'saladinha_da_casa.png': 'salada_da_casa.png',
  'sobrecoxa_ao_carvao_1_pessoa.png': 'sobrecoxa_ao_carvao.png'
}

missingImages.forEach(missingImage => {
  // Verificar nome original
  if (localFiles.includes(missingImage)) {
    availableForUpload.push({
      missing: missingImage,
      local: missingImage,
      size: fs.statSync(path.join(localImagesDir, missingImage)).size
    })
  }
  // Verificar nome alternativo
  else if (nameMapping[missingImage] && localFiles.includes(nameMapping[missingImage])) {
    availableForUpload.push({
      missing: missingImage,
      local: nameMapping[missingImage],
      size: fs.statSync(path.join(localImagesDir, nameMapping[missingImage])).size
    })
  }
  // Não encontrada
  else {
    notAvailableLocally.push(missingImage)
  }
})

// Resultados
console.log('✅ IMAGENS DISPONÍVEIS PARA UPLOAD:')
if (availableForUpload.length === 0) {
  console.log('   Nenhuma imagem faltante encontrada localmente')
} else {
  availableForUpload.forEach((img, index) => {
    const sizeMB = (img.size / 1024 / 1024).toFixed(1)
    const mapping = img.missing !== img.local ? ` (como ${img.local})` : ''
    console.log(`   ${index + 1}. ${img.missing}${mapping} - ${sizeMB}MB`)
  })
}

console.log('\n❌ IMAGENS NÃO ENCONTRADAS LOCALMENTE:')
if (notAvailableLocally.length === 0) {
  console.log('   Todas as imagens faltantes estão disponíveis!')
} else {
  notAvailableLocally.forEach((img, index) => {
    console.log(`   ${index + 1}. ${img}`)
  })
}

console.log('\n📊 RESUMO:')
console.log(`✅ Disponíveis para upload: ${availableForUpload.length}`)
console.log(`❌ Não encontradas localmente: ${notAvailableLocally.length}`)
console.log(`📝 Total faltantes: ${missingImages.length}`)

if (availableForUpload.length > 0) {
  console.log('\n🚀 PRÓXIMOS PASSOS:')
  console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard')
  console.log('2. Navegue para Storage → Buckets → menu-images')
  console.log('3. Faça upload manual das imagens disponíveis listadas acima')
  console.log('4. Execute: node scripts/check-all-menu-images.js para verificar')
  
  console.log('\n📋 COMANDOS DE UPLOAD MANUAL (Dashboard):')
  availableForUpload.forEach(img => {
    console.log(`   Upload: ${img.local} → Renomear para: ${img.missing}`)
  })
}

console.log('\n💡 DICA: As imagens não encontradas precisam ser criadas/obtidas primeiro.') 