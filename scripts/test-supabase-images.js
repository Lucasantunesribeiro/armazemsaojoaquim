const https = require('https');

// URLs de teste das imagens do Supabase
const testUrls = [
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bolinho_de_bacalhau.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/atum_em_crosta.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caprese_mineira.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/picanha_ao_carvao.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/hamburguer_da_casa.png'
];

// Função para testar uma URL
function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      
      resolve({
        url,
        status,
        contentType,
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
  console.log('🧪 Testando URLs das imagens do Supabase Storage...\n');
  
  const results = await Promise.all(testUrls.map(testUrl));
  
  let successCount = 0;
  let errorCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const statusText = result.success ? 'OK' : `ERRO (${result.status})`;
    
    console.log(`${icon} ${statusText} - ${result.url}`);
    
    if (result.success) {
      console.log(`   📄 Content-Type: ${result.contentType}`);
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
    console.log('🔧 As configurações do Next.js devem funcionar corretamente.');
  } else {
    console.log('\n⚠️  Algumas imagens não estão acessíveis.');
    console.log('🔍 Verifique se as imagens foram enviadas para o bucket correto.');
  }
}

// Executar os testes
testAllUrls().catch(console.error); 