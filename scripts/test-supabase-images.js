const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO IMAGENS DO SUPABASE STORAGE...\n');

// URLs das imagens do Supabase baseadas no SQL fornecido
const supabaseImageUrls = [
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caprese_mineira.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/palmito_pupunha.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/atum_em_crosta.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_com_frango.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/pastel_de_queijo.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_sem_frango.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/torresmo.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/salada_de_graos_com_tilapia.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/polvo_grelhado_com_arroz_negro.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/delicia_de_manga.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/tilapia_na_brasa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/salada_de_graos_com_frango.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/picanha_ao_carvao.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/croqueta_de_costela.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/tarte_aux_pommes.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/iscas_de_peixe.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bolinho_de_bacalhau.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/risoto_de_bacalhau.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/mix_na_brasa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/chori_pao.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/hamburguer_da_casa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/pasteis_carne_seca_e_creme_de_queijo.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/tilapia_grelhada.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/pao_de_alho.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/feijao.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bolinho_de_feijoada.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/moqueca_de_banana_da_terra.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/salada_da_casa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/posta_de_salmao_grelhado.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/arroz.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/marquise_au_chocolat.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/linguica_na_brasa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bife_ancho.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/iscas_de_frango.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/vinagrete_de_polvo.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/patatas_brava.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/mix_vegetariano.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/sobrecoxa_ao_carvao.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/legumes_na_brasa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/envelopado_de_acelga.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/farofa.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/feijoada_da_casa_individual.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/pasteis_de_pupunha.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/patatas_bravas.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/feijoada_da_casa_para_dois.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/feijoada_da_casa_buffet.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/ceviche_carioca.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/pure_de_batata.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/hamburguer_vegetariano.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bife_a_milanesa.png'
];

async function checkImageUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      const { statusCode, headers } = response;
      const contentType = headers['content-type'] || '';
      const contentLength = headers['content-length'] || 'unknown';
      
      resolve({
        url,
        status: statusCode,
        contentType,
        contentLength,
        isImage: contentType.startsWith('image/'),
        isAccessible: statusCode === 200
      });
      
      // Consumir resposta para evitar vazamentos de memória
      response.resume();
    }).on('error', (error) => {
      resolve({
        url,
        error: error.message,
        isAccessible: false
      });
    });
    
    // Timeout de 10 segundos
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        error: 'Timeout',
        isAccessible: false
      });
    });
  });
}

async function checkAllImages() {
  console.log(`📊 Verificando ${supabaseImageUrls.length} imagens...\n`);
  
  const results = [];
  let accessibleCount = 0;
  let errorCount = 0;
  
  // Verificar imagens em lotes para não sobrecarregar
  const batchSize = 5;
  for (let i = 0; i < supabaseImageUrls.length; i += batchSize) {
    const batch = supabaseImageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkImageUrl));
    
    batchResults.forEach(result => {
      results.push(result);
      
      const fileName = result.url.split('/').pop();
      
      if (result.isAccessible) {
        console.log(`✅ ${fileName} - ${result.status} - ${result.contentLength} bytes - ${result.contentType}`);
        accessibleCount++;
      } else {
        console.log(`❌ ${fileName} - ${result.error || result.status || 'Erro desconhecido'}`);
        errorCount++;
      }
    });
    
    // Pequena pausa entre lotes
    if (i + batchSize < supabaseImageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📈 RESUMO:');
  console.log(`✅ Imagens acessíveis: ${accessibleCount}`);
  console.log(`❌ Imagens com erro: ${errorCount}`);
  console.log(`📊 Total verificado: ${results.length}`);
  
  // Verificar imagens locais de fallback
  console.log('\n🔍 VERIFICANDO IMAGENS LOCAIS DE FALLBACK:');
  const localImages = [
    'public/images/placeholder.jpg',
    'public/images/placeholder.svg',
    'public/images/logo.jpg',
    'public/images/logo.webp',
    'public/images/logo.avif'
  ];
  
  localImages.forEach(imagePath => {
    const fullPath = path.join(process.cwd(), imagePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${imagePath} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`❌ ${imagePath} - NÃO ENCONTRADO`);
    }
  });
  
  // Gerar relatório detalhado
  const errorImages = results.filter(r => !r.isAccessible);
  if (errorImages.length > 0) {
    console.log('\n🚨 IMAGENS COM PROBLEMAS:');
    errorImages.forEach(img => {
      const fileName = img.url.split('/').pop();
      console.log(`   - ${fileName}: ${img.error || img.status}`);
    });
    
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('1. Verificar se as imagens existem no bucket Supabase Storage');
    console.log('2. Verificar permissões do bucket (deve ser público)');
    console.log('3. Verificar se os nomes dos arquivos estão corretos');
    console.log('4. Considerar usar imagens locais como fallback');
  }
}

checkAllImages().catch(console.error); 