#!/usr/bin/env node

/**
 * Script para fazer upload das imagens faltantes do menu para o Supabase Storage
 * 
 * Este script:
 * 1. Identifica imagens que existem localmente mas não estão no Supabase
 * 2. Faz upload dessas imagens para o bucket 'menu-images' 
 * 3. Relata o progresso e resultados
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://enolssforaepnrpfrima.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  console.error('❌ ERRO: SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY não encontrada')
  console.error('   Configure a variável de ambiente antes de executar este script')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Arquivos que existem localmente e precisam ser enviados
const MISSING_FILES = [
  'bife_a_milanesa.png',
  'ceviche_carioca.png', 
  'envelopado_de_acelga.png',
  'farofa.png',
  'feijoada_da_casa_buffet.png',
  'feijoada_da_casa_individual.png',
  'feijoada_da_casa_para_dois.png',
  'hamburguer_vegetariano.png',
  'legumes_na_brasa.png',
  'linguica_na_brasa.png',
  'marquise_au_chocolat.png',
  'mix_vegetariano.png',
  'pasteis_de_pupunha.png',
  'patatas_brava.png',
  'patatas_bravas.png',
  'pure_de_batata.png',
  'sobrecoxa_ao_carvao.png',
  'vinagrete_de_polvo.png'
]

async function uploadImage(filename) {
  const localPath = path.join(__dirname, '..', 'public', 'images', 'menu_images', filename)
  
  console.log(`🔍 Verificando: ${filename}`)
  
  // Verificar se arquivo existe localmente
  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠️  Arquivo não encontrado localmente: ${localPath}`)
    return { success: false, error: 'Arquivo não encontrado localmente' }
  }
  
  try {
    // Ler arquivo
    const fileBuffer = fs.readFileSync(localPath)
    const fileSize = (fileBuffer.length / 1024 / 1024).toFixed(2)
    
    console.log(`   📁 Arquivo encontrado (${fileSize}MB)`)
    
    // Upload para Supabase
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filename, fileBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true // Substitui se já existir
      })
    
    if (error) {
      console.log(`   ❌ Erro no upload: ${error.message}`)
      return { success: false, error: error.message }
    }
    
    console.log(`   ✅ Upload realizado com sucesso!`)
    return { success: true, data }
    
  } catch (error) {
    console.log(`   ❌ Erro inesperado: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Iniciando upload das imagens faltantes do menu')
  console.log(`📊 ${MISSING_FILES.length} arquivos para processar\n`)
  
  let sucessos = 0
  let falhas = 0
  const resultados = []
  
  for (const filename of MISSING_FILES) {
    const resultado = await uploadImage(filename)
    resultados.push({ filename, ...resultado })
    
    if (resultado.success) {
      sucessos++
    } else {
      falhas++
    }
    
    // Pequena pausa entre uploads
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n📋 RESUMO FINAL:')
  console.log(`✅ Sucessos: ${sucessos}`)
  console.log(`❌ Falhas: ${falhas}`)
  console.log(`📊 Total: ${sucessos + falhas}`)
  
  if (falhas > 0) {
    console.log('\n❌ Arquivos que falharam:')
    resultados
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.filename}: ${r.error}`))
  }
  
  if (sucessos > 0) {
    console.log('\n✅ Próximos passos:')
    console.log('1. Verifique se as imagens foram carregadas no Supabase Storage')
    console.log('2. Teste o menu no frontend para confirmar que as imagens aparecem')
    console.log('3. Se necessário, execute o script de verificação de imagens')
  }
}

// Executar script
main().catch(error => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
}) 