const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('📥 BAIXANDO IMAGENS FUNCIONAIS DO SUPABASE...\n');

// Imagens que funcionaram no teste anterior
const workingImages = [
  'caprese_mineira.png',
  'palmito_pupunha.png',
  'atum_em_crosta.png',
  'caesar_salad_com_frango.png',
  'pastel_de_queijo.png',
  'caesar_salad_sem_frango.png',
  'torresmo.png',
  'salada_de_graos_com_tilapia.png',
  'polvo_grelhado_com_arroz_negro.png',
  'delicia_de_manga.png',
  'tilapia_na_brasa.png',
  'salada_de_graos_com_frango.png',
  'picanha_ao_carvao.png',
  'croqueta_de_costela.png',
  'tarte_aux_pommes.png',
  'iscas_de_peixe.png',
  'bolinho_de_bacalhau.png',
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
  'salada_da_casa.png',
  'posta_de_salmao_grelhado.png',
  'arroz.png',
  'bife_ancho.png',
  'iscas_de_frango.png'
];

const baseUrl = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/';
const outputDir = path.join(process.cwd(), 'public/images/menu_images');

// Criar diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Diretório criado: ${outputDir}`);
}

function downloadImage(filename) {
  return new Promise((resolve) => {
    const url = baseUrl + filename;
    const outputPath = path.join(outputDir, filename);
    
    // Verificar se já existe
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  ${filename} - já existe localmente`);
      resolve({ filename, status: 'exists' });
      return;
    }
    
    const file = fs.createWriteStream(outputPath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(outputPath);
          console.log(`✅ ${filename} - ${(stats.size / 1024).toFixed(2)} KB baixado`);
          resolve({ filename, status: 'downloaded', size: stats.size });
        });
      } else {
        file.close();
        fs.unlinkSync(outputPath); // Remove arquivo vazio
        console.log(`❌ ${filename} - Erro ${response.statusCode}`);
        resolve({ filename, status: 'error', code: response.statusCode });
      }
    });
    
    request.on('error', (error) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath); // Remove arquivo vazio
      }
      console.log(`❌ ${filename} - ${error.message}`);
      resolve({ filename, status: 'error', error: error.message });
    });
    
    request.setTimeout(15000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath); // Remove arquivo vazio
      }
      console.log(`⏱️  ${filename} - Timeout`);
      resolve({ filename, status: 'timeout' });
    });
  });
}

async function downloadAllImages() {
  console.log(`📊 Baixando ${workingImages.length} imagens...\n`);
  
  const results = [];
  let downloadedCount = 0;
  let existsCount = 0;
  let errorCount = 0;
  
  // Baixar em lotes para não sobrecarregar
  const batchSize = 3;
  for (let i = 0; i < workingImages.length; i += batchSize) {
    const batch = workingImages.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(downloadImage));
    
    batchResults.forEach(result => {
      results.push(result);
      
      switch (result.status) {
        case 'downloaded':
          downloadedCount++;
          break;
        case 'exists':
          existsCount++;
          break;
        default:
          errorCount++;
      }
    });
    
    // Pequena pausa entre lotes
    if (i + batchSize < workingImages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📈 RESUMO:');
  console.log(`📥 Baixados: ${downloadedCount}`);
  console.log(`⏭️  Já existiam: ${existsCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📊 Total processado: ${results.length}`);
  
  if (downloadedCount + existsCount > 0) {
    console.log(`\n✅ ${downloadedCount + existsCount} imagens disponíveis localmente em:`);
    console.log(`   ${outputDir}`);
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Atualizar SafeImage para usar imagens locais como fallback primário');
    console.log('2. Manter URLs do Supabase como fonte principal quando funcionam');
    console.log('3. Testar o sistema de fallback no desenvolvimento');
  }
  
  return results;
}

downloadAllImages().catch(console.error); 