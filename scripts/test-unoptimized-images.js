const https = require('https');

// URLs diretas das imagens do Supabase (sem otimização do Next.js)
const testUrls = [
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bolinho_de_bacalhau.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/atum_em_crosta.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/ceviche_carioca.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/feijoada_da_casa_individual.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/marquise_au_chocolat.png'
];

// Função para testar uma URL
function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      
      resolve({
        url,
        status,
        contentType,
        contentLength,
        success: status === 200,
        isImage: contentType && contentType.startsWith('image/')
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        success: false,
        isImage: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        isImage: false
      });
    });
  });
}

// Testar todas as URLs
async function testAllUrls() {
  console.log('🧪 Testando imagens do Supabase (modo unoptimized)...\n');
  
  const results = await Promise.all(testUrls.map(testUrl));
  
  let successCount = 0;
  let errorCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const statusText = result.success ? 'OK' : `ERRO (${result.status})`;
    
    console.log(`${icon} ${statusText} - Imagem ${index + 1}`);
    console.log(`   🔗 URL: ${result.url.split('/').pop()}`);
    
    if (result.success) {
      console.log(`   📄 Content-Type: ${result.contentType}`);
      console.log(`   📏 Tamanho: ${Math.round(result.contentLength / 1024)} KB`);
      console.log(`   🖼️  É imagem: ${result.isImage ? 'Sim' : 'Não'}`);
      successCount++;
    } else {
      if (result.error) {
        console.log(`   ⚠️  Erro: ${result.error}`);
      }
      errorCount++;
    }
    console.log('');
  });
  
  console.log('📊 RESUMO:');
  console.log(`✅ Sucessos: ${successCount}/${testUrls.length}`);
  console.log(`❌ Erros: ${errorCount}/${testUrls.length}`);
  
  if (successCount === testUrls.length) {
    console.log('\n🎉 Todas as imagens do Supabase estão acessíveis!');
    console.log('✅ Com unoptimized=true, as imagens devem carregar sem erro 400.');
    console.log('🔧 Agora acesse http://localhost:3000/menu para verificar.');
  } else if (successCount > 0) {
    console.log('\n⚠️  Algumas imagens estão funcionando, outras não.');
    console.log('🔍 Pode haver problemas específicos com certas imagens.');
  } else {
    console.log('\n❌ Nenhuma imagem está acessível.');
    console.log('🔧 Verifique se as imagens foram enviadas para o Supabase Storage.');
  }
}

// Executar os testes
testAllUrls().catch(console.error); 