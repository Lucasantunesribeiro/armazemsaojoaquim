const http = require('http');

// Teste do loader personalizado do Supabase
const testUrls = [
  // Teste 1: URL transformada pelo loader personalizado
  'http://localhost:3000/_next/image?url=menu-images%2Fbolinho_de_bacalhau.png&w=640&q=75',
  
  // Teste 2: Outra imagem
  'http://localhost:3000/_next/image?url=menu-images%2Fatum_em_crosta.png&w=640&q=75',
  
  // Teste 3: Teste com URL completa (deve ser processada pelo loader)
  'http://localhost:3000/_next/image?url=https%3A%2F%2Fenolssforaepnrpfrima.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fmenu-images%2Fceviche_carioca.png&w=640&q=75',
];

// Função para testar uma URL
function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      
      resolve({
        url,
        status,
        contentType,
        contentLength,
        success: status === 200,
        isImage: contentType && contentType.startsWith('image/'),
        isOptimized: contentType && (contentType.includes('webp') || contentType.includes('jpeg'))
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        success: false,
        isImage: false,
        isOptimized: false
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        isImage: false,
        isOptimized: false
      });
    });
  });
}

// Testar todas as URLs
async function testAllUrls() {
  console.log('🧪 Testando Supabase Image Loader personalizado...\n');
  
  const results = await Promise.all(testUrls.map(testUrl));
  
  let successCount = 0;
  let errorCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const statusText = result.success ? 'OK' : `ERRO (${result.status})`;
    
    console.log(`${icon} ${statusText} - Teste ${index + 1}`);
    console.log(`   🔗 URL: ${result.url.substring(0, 80)}...`);
    
    if (result.success) {
      console.log(`   📄 Content-Type: ${result.contentType}`);
      console.log(`   📏 Content-Length: ${result.contentLength} bytes`);
      console.log(`   🖼️  É imagem: ${result.isImage ? 'Sim' : 'Não'}`);
      console.log(`   ⚡ Otimizada: ${result.isOptimized ? 'Sim' : 'Não'}`);
      successCount++;
    } else {
      if (result.error) {
        console.log(`   ⚠️  Erro: ${result.error}`);
      }
      if (result.status === 400) {
        console.log(`   🔧 Erro 400: Problema com o loader personalizado`);
      }
      errorCount++;
    }
    console.log('');
  });
  
  console.log('📊 RESUMO:');
  console.log(`✅ Sucessos: ${successCount}/${testUrls.length}`);
  console.log(`❌ Erros: ${errorCount}/${testUrls.length}`);
  
  if (successCount === testUrls.length) {
    console.log('\n🎉 Loader personalizado do Supabase está funcionando!');
    console.log('✅ Imagens estão sendo processadas pela API de transformação do Supabase.');
  } else if (successCount > 0) {
    console.log('\n⚠️  Algumas imagens estão funcionando, outras não.');
    console.log('🔍 Pode ser um problema específico de configuração do loader.');
  } else {
    console.log('\n❌ Loader personalizado não está funcionando.');
    console.log('🔧 Verifique a configuração do next.config.js e do loader.');
  }
}

// Executar os testes
testAllUrls().catch(console.error); 