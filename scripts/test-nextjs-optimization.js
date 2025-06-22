const https = require('https');
const http = require('http');

// URLs de teste do Next.js Image Optimization
const testUrls = [
  // Imagem do Supabase através do otimizador do Next.js
  'http://localhost:3000/_next/image?url=https%3A%2F%2Fenolssforaepnrpfrima.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fmenu-images%2Fbolinho_de_bacalhau.png&w=640&q=75',
  'http://localhost:3000/_next/image?url=https%3A%2F%2Fenolssforaepnrpfrima.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fmenu-images%2Fatum_em_crosta.png&w=640&q=75',
  'http://localhost:3000/_next/image?url=https%3A%2F%2Fenolssforaepnrpfrima.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fmenu-images%2Fcaprese_mineira.png&w=640&q=75',
  
  // Imagem local para comparação
  'http://localhost:3000/_next/image?url=%2Fimages%2Flogo.jpg&w=640&q=75'
];

// Função para testar uma URL
function testUrl(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.get(url, (res) => {
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
  console.log('🧪 Testando otimização de imagens do Next.js...\n');
  
  // Verificar se o servidor está rodando
  console.log('🔍 Verificando se o servidor Next.js está rodando...');
  const serverTest = await testUrl('http://localhost:3000');
  
  if (!serverTest.success && serverTest.status !== 'ERROR') {
    console.log('❌ Servidor Next.js não está rodando na porta 3000');
    console.log('🚀 Execute: npm run dev');
    return;
  }
  
  console.log('✅ Servidor Next.js está rodando\n');
  
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
        console.log(`   🔧 Erro 400: Configuração do remotePatterns pode estar incorreta`);
      }
      errorCount++;
    }
    console.log('');
  });
  
  console.log('📊 RESUMO:');
  console.log(`✅ Sucessos: ${successCount}/${testUrls.length}`);
  console.log(`❌ Erros: ${errorCount}/${testUrls.length}`);
  
  if (successCount === testUrls.length) {
    console.log('\n🎉 Otimização do Next.js está funcionando perfeitamente!');
    console.log('✅ Imagens do Supabase Storage estão sendo otimizadas corretamente.');
  } else if (successCount > 0) {
    console.log('\n⚠️  Algumas imagens estão funcionando, outras não.');
    console.log('🔍 Pode ser um problema específico de configuração.');
  } else {
    console.log('\n❌ Nenhuma imagem está sendo otimizada.');
    console.log('🔧 Verifique a configuração do next.config.js');
  }
}

// Executar os testes
testAllUrls().catch(console.error); 