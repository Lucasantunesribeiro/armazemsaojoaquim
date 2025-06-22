#!/usr/bin/env node

/**
 * Script para fazer upload das imagens faltantes para o Supabase Storage
 * Utiliza a API do Supabase para enviar as imagens do diretório local
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

// Lista das imagens faltantes
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

// Diretório onde estão as imagens locais
const localImagesDir = path.join(__dirname, '..', 'public', 'images', 'menu_images')

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