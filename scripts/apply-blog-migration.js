const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - usando anon key para testes básicos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqnrizdoabeuxuhpvqti.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbnJpemRvYWJldXh1aHB2cXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzgzNjcsImV4cCI6MjA1MDkxNDM2N30.CBv-zFJiQPwQYOLbQoZGBuaT6JQQYTqsNDR0nRmQcuk';

console.log('🔄 Verificando migração do blog...');

async function applyBlogMigration() {
  try {
    // Testar conectividade básica
    console.log('🔍 Testando conectividade com Supabase...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Testar se conseguimos acessar a tabela blog_posts
    const { data: testData, error: testError } = await supabase
      .from('blog_posts')
      .select('id, title, content')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro ao conectar ao Supabase:', testError);
      return;
    }
    
    console.log('✅ Conectividade OK. Posts encontrados:', testData?.length || 0);
    
    // Testar se content_html já existe
    console.log('🔍 Verificando se campo content_html já existe...');
    const { data: htmlTest, error: htmlError } = await supabase
      .from('blog_posts')
      .select('content_html')
      .limit(1);
    
    if (htmlError) {
      if (htmlError.message.includes('content_html') || htmlError.code === '42703') {
        console.log('⚠️  Campo content_html NÃO existe ainda');
        console.log('');
        console.log('👨‍💻 MIGRAÇÃO NECESSÁRIA:');
        console.log('Execute estas queries no painel do Supabase (SQL Editor):');
        console.log('');
        console.log('-- 1. Adicionar coluna content_html');
        console.log('ALTER TABLE blog_posts ADD COLUMN content_html TEXT;');
        console.log('');
        console.log('-- 2. Migrar dados existentes (copiar content para content_html)');
        console.log('UPDATE blog_posts SET content_html = content WHERE content_html IS NULL;');
        console.log('');
        console.log('-- 3. Adicionar índice para busca (opcional)');
        console.log("CREATE INDEX IF NOT EXISTS idx_blog_posts_content_html ON blog_posts USING gin(to_tsvector('portuguese', content_html));");
        console.log('');
        console.log('🚀 Após executar essas queries, rode este script novamente para verificar.');
        return;
      } else {
        console.error('❌ Erro inesperado:', htmlError);
        return;
      }
    }
    
    console.log('✅ Campo content_html JÁ EXISTE!');
    console.log('📊 Dados encontrados:', htmlTest?.length || 0);
    
    // Verificar quantos posts têm content_html vazio
    const { data: emptyHtml, error: emptyError } = await supabase
      .from('blog_posts')
      .select('id, title, content')
      .is('content_html', null);
    
    if (emptyError) {
      console.error('❌ Erro ao verificar posts sem HTML:', emptyError);
      return;
    }
    
    if (emptyHtml && emptyHtml.length > 0) {
      console.log(`⚠️  Encontrados ${emptyHtml.length} posts sem content_html`);
      console.log('👨‍💻 Execute esta query no painel do Supabase para migrar dados:');
      console.log('UPDATE blog_posts SET content_html = content WHERE content_html IS NULL;');
    } else {
      console.log('✅ Todos os posts já têm content_html preenchido!');
    }
    
    console.log('');
    console.log('🎉 MIGRAÇÃO VERIFICADA COM SUCESSO!');
    console.log('📝 O Rich Text Editor pode salvar em content_html');
    console.log('📖 As páginas de leitura podem usar content_html');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

applyBlogMigration();