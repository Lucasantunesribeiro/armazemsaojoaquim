const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔍 TESTANDO SISTEMA COMPLETO DE IMAGENS...\n');

// Algumas URLs de teste do SQL
const testImageUrls = [
  // URLs que funcionam
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caprese_mineira.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/hamburguer_da_casa.png',
  
  // URLs que não funcionam (erro 400)
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/marquise_au_chocolat.png',
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/farofa.png',
  
  // URL inválida para teste
  'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/inexistente.png'
];

async function testImageUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        accessible: response.statusCode === 200
      });
      response.resume();
    }).on('error', (error) => {
      resolve({
        url,
        error: error.message,
        accessible: false
      });
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve({
        url,
        error: 'Timeout',
        accessible: false
      });
    });
  });
}

function testFallbackSystem(supabaseUrl) {
  if (!supabaseUrl.includes('supabase.co/storage/v1/object/public/menu-images/')) {
    return { error: 'URL não é do Supabase menu-images' };
  }
  
  const filename = supabaseUrl.split('/').pop();
  
  const fallbacks = [
    {
      level: 0,
      type: 'original',
      url: supabaseUrl
    },
    {
      level: 1,
      type: 'local',
      url: `/images/menu_images/${filename}`,
      localPath: path.join(process.cwd(), 'public/images/menu_images', filename)
    },
    {
      level: 2,
      type: 'placeholder',
      url: '/images/placeholder.jpg',
      localPath: path.join(process.cwd(), 'public/images/placeholder.jpg')
    }
  ];
  
  const results = fallbacks.map(fallback => {
    if (fallback.localPath) {
      const exists = fs.existsSync(fallback.localPath);
      return {
        ...fallback,
        available: exists,
        size: exists ? fs.statSync(fallback.localPath).size : 0
      };
    }
    return {
      ...fallback,
      available: null // Precisa ser testado via HTTP
    };
  });
  
  return { filename, fallbacks: results };
}

async function runTests() {
  console.log('📊 TESTANDO URLs DO SUPABASE:');
  
  const supabaseResults = await Promise.all(testImageUrls.map(testImageUrl));
  
  supabaseResults.forEach(result => {
    const icon = result.accessible ? '✅' : '❌';
    const status = result.accessible ? `HTTP ${result.status}` : (result.error || `HTTP ${result.status}`);
    const filename = result.url.split('/').pop();
    
    console.log(`${icon} ${filename} - ${status}`);
  });
  
  console.log('\n🔄 TESTANDO SISTEMA DE FALLBACK:');
  
  testImageUrls.forEach(url => {
    const fallbackTest = testFallbackSystem(url);
    
    if (fallbackTest.error) {
      console.log(`❓ ${url} - ${fallbackTest.error}`);
      return;
    }
    
    console.log(`\n📁 ${fallbackTest.filename}:`);
    
    fallbackTest.fallbacks.forEach(fallback => {
      let status = '';
      
      if (fallback.available === true) {
        status = `✅ Disponível (${(fallback.size / 1024).toFixed(2)} KB)`;
      } else if (fallback.available === false) {
        status = '❌ Não encontrado';
      } else {
        status = '🔄 Precisa teste HTTP';
      }
      
      console.log(`   ${fallback.level}. ${fallback.type}: ${status}`);
      console.log(`      URL: ${fallback.url}`);
    });
  });
  
  console.log('\n📋 RESUMO DO SISTEMA:');
  
  // Verificar quantas imagens locais existem
  const menuImagesDir = path.join(process.cwd(), 'public/images/menu_images');
  let localImagesCount = 0;
  
  if (fs.existsSync(menuImagesDir)) {
    const files = fs.readdirSync(menuImagesDir).filter(f => f.endsWith('.png'));
    localImagesCount = files.length;
    console.log(`✅ ${localImagesCount} imagens disponíveis localmente`);
  } else {
    console.log('❌ Diretório de imagens local não encontrado');
  }
  
  // Verificar placeholder
  const placeholderPath = path.join(process.cwd(), 'public/images/placeholder.jpg');
  if (fs.existsSync(placeholderPath)) {
    console.log('✅ Placeholder disponível');
  } else {
    console.log('❌ Placeholder não encontrado');
  }
  
  // Estatísticas do Supabase
  const accessibleCount = supabaseResults.filter(r => r.accessible).length;
  const failedCount = supabaseResults.filter(r => !r.accessible).length;
  
  console.log(`\n📈 ESTATÍSTICAS:`)
  console.log(`   Supabase funcionando: ${accessibleCount}/${testImageUrls.length}`);
  console.log(`   Supabase com erro: ${failedCount}/${testImageUrls.length}`);
  console.log(`   Fallback local: ${localImagesCount} imagens`);
  
  console.log('\n💡 RECOMENDAÇÕES:');
  
  if (accessibleCount > 0) {
    console.log('✅ Usar URLs do Supabase como fonte primária');
  } else {
    console.log('⚠️  Considerar usar apenas imagens locais');
  }
  
  if (localImagesCount > 20) {
    console.log('✅ Sistema de fallback local bem configurado');
  } else {
    console.log('⚠️  Expandir coleção de imagens locais');
  }
  
  if (fs.existsSync(placeholderPath)) {
    console.log('✅ Fallback final (placeholder) configurado');
  } else {
    console.log('❌ Configurar placeholder para fallback final');
  }
}

runTests().catch(console.error); 