const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqnrizdoabeuxuhpvqti.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbnJpemRvYWJldXh1aHB2cXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzgzNjcsImV4cCI6MjA1MDkxNDM2N30.CBv-zFJiQPwQYOLbQoZGBuaT6JQQYTqsNDR0nRmQcuk';

console.log('🔄 Conectando ao Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function addHtmlContentColumn() {
  try {
    console.log('📝 Adicionando campo content_html à tabela blog_posts...');
    
    // Primeiro, tentar acessar a tabela para ver se já existe
    const { data: testData, error: testError } = await supabase
      .from('blog_posts')
      .select('id, content')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro ao acessar tabela blog_posts:', testError);
      return;
    }
    
    console.log('✅ Tabela blog_posts acessível');
    console.log('📊 Dados de teste:', testData);
    
    // Verificar se content_html já existe
    const { data: schemaData, error: schemaError } = await supabase
      .from('blog_posts')
      .select('content_html')
      .limit(1);
    
    if (schemaError) {
      if (schemaError.message.includes('content_html')) {
        console.log('🔄 Campo content_html não existe ainda, precisará ser adicionado via migração SQL');
        console.log('👨‍💻 Execute esta query no painel do Supabase:');
        console.log('');
        console.log('ALTER TABLE blog_posts ADD COLUMN content_html TEXT;');
        console.log('UPDATE blog_posts SET content_html = content WHERE content_html IS NULL;');
        console.log('');
      } else {
        console.error('❌ Erro inesperado:', schemaError);
      }
    } else {
      console.log('✅ Campo content_html já existe!');
      console.log('📊 Dados de exemplo:', schemaData);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addHtmlContentColumn();