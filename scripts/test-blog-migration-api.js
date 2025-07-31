const http = require('http');

console.log('🔄 Testando migração via API local...');

async function testBlogMigration() {
  try {
    // Fazer uma requisição para a API local para testar se funciona
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
    };

    console.log('🔍 Testando conectividade com API local...');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ API local respondendo:', res.statusCode);
        console.log('📊 Resposta:', data);
        
        // Agora testar a API do blog (requer auth)
        console.log('🔍 Para testar migração, acesse o painel admin:');
        console.log('👉 http://localhost:3000/admin/blog');
        console.log('');
        console.log('📝 Se o Rich Text Editor estiver funcionando, a migração foi aplicada!');
        console.log('🎯 Verificar se consegue criar/editar posts com HTML rico');
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro ao conectar à API local:', e.message);
      console.log('');
      console.log('💡 Verifique se o servidor está rodando:');
      console.log('   npm run dev');
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testBlogMigration();