const https = require('https');

// Lista de todas as imagens mencionadas no SQL
const allMenuImages = [
  'bolinho_de_bacalhau.png',
  'atum_em_crosta.png',
  'caprese_mineira.png',
  'caesar_salad_com_fatias_de_frango.png',
  'pastel_de_queijo.png',
  'caesar_salad_sem_fatias_de_frango.png',
  'torresmo.png',
  'salada_de_graos_com_tilapia.png',
  'polvo_grelhado_com_arroz_negro.png',
  'delicia_de_manga.png',
  'tilapia_na_brasa.png',
  'salada_de_graos_com_frango.png',
  'picanha_ao_carvao_2_pessoas.png',
  'croqueta_de_costela.png',
  'tarte_aux_pommes.png',
  'iscas_de_peixe.png',
  'risoto_de_bacalhau.png',
  'mix_na_brasa.png',
  'chori_pao.png',
  'hamburguer_da_casa.png',
  'pasteis_carne_seca_e_creme_de_queijo.png',
  'tilapia_grelhada.png',
  'pao_de_alho.png',
  'feijao.png',
  'bolinho_de_feijoada.png',
  'moqueca_de_banana_da_terra.png',
  'saladinha_da_casa.png',
  'posta_de_salmao_grelhado.png',
  'arroz.png',
  'marquise_au_chocolat.png',
  'linguica_na_brasa.png',
  'bife_ancho.png',
  'iscas_de_frango.png',
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
];

// Função para testar uma imagem
function testImage(imageName) {
  return new Promise((resolve) => {
    const url = `https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/${imageName}`;
    
    const req = https.get(url, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      
      resolve({
        imageName,
        url,
        status,
        contentType,
        contentLength,
        exists: status === 200,
        isImage: contentType && contentType.startsWith('image/'),
        sizeKB: contentLength ? Math.round(contentLength / 1024) : 0
      });
    });

    req.on('error', (error) => {
      resolve({
        imageName,
        url,
        status: 'ERROR',
        error: error.message,
        exists: false,
        isImage: false,
        sizeKB: 0
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        imageName,
        url,
        status: 'TIMEOUT',
        exists: false,
        isImage: false,
        sizeKB: 0
      });
    });
  });
}

// Testar todas as imagens
async function checkAllImages() {
  console.log('🔍 Verificando todas as imagens do menu no Supabase Storage...\n');
  console.log(`📊 Total de imagens para verificar: ${allMenuImages.length}\n`);
  
  const results = await Promise.all(allMenuImages.map(testImage));
  
  const existingImages = results.filter(r => r.exists);
  const missingImages = results.filter(r => !r.exists);
  
  console.log('✅ IMAGENS EXISTENTES:');
  existingImages.forEach((result, index) => {
    console.log(`${index + 1}. ${result.imageName} (${result.sizeKB} KB)`);
  });
  
  console.log('\n❌ IMAGENS FALTANDO:');
  missingImages.forEach((result, index) => {
    console.log(`${index + 1}. ${result.imageName} - Status: ${result.status}`);
  });
  
  console.log('\n📊 RESUMO FINAL:');
  console.log(`✅ Imagens existentes: ${existingImages.length}/${allMenuImages.length}`);
  console.log(`❌ Imagens faltando: ${missingImages.length}/${allMenuImages.length}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((existingImages.length / allMenuImages.length) * 100)}%`);
  
  if (existingImages.length === allMenuImages.length) {
    console.log('\n🎉 Todas as imagens estão disponíveis no Supabase Storage!');
    console.log('✅ O problema dos erros 400 deve estar resolvido.');
  } else if (existingImages.length > 0) {
    console.log('\n⚠️  Algumas imagens estão faltando no Supabase Storage.');
    console.log('🔧 Você precisa fazer upload das imagens faltantes.');
    console.log('\n📝 Lista das imagens que precisam ser enviadas:');
    missingImages.forEach(img => console.log(`   - ${img.imageName}`));
  } else {
    console.log('\n❌ Nenhuma imagem foi encontrada no Supabase Storage.');
    console.log('🔧 Você precisa fazer upload de todas as imagens para o bucket "menu-images".');
  }
}

// Executar a verificação
checkAllImages().catch(console.error); 