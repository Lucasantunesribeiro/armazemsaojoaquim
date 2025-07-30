const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://enolssforaepnrpfrima.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2xzc2ZvcmFlcG5ycGZyaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQxNDYzOSwiZXhwIjoyMDY0OTkwNjM5fQ.nGlNqzIJ2EzM-fdtCiHDAFixizSBWFJtWrZuxxAcxeI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigration() {
  console.log('🧪 Testando migração consolidada...\n');
  
  const results = {
    tables: { success: 0, failed: 0 },
    functions: { success: 0, failed: 0 },
    views: { success: 0, failed: 0 }
  };
  
  // 1. Testar tabelas
  console.log('📊 Testando tabelas...');
  const tablesToTest = [
    'profiles',
    'users', // view
    'pousada_rooms',
    'pousada_bookings',
    'cafe_products',
    'cafe_orders',
    'art_gallery',
    'art_orders',
    'timezone_cache',
    'slow_queries_monitor'
  ];
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        results.tables.failed++;
      } else {
        console.log(`✅ ${table}: OK`);
        results.tables.success++;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      results.tables.failed++;
    }
  }
  
  // 2. Testar funções RPC
  console.log('\n🔧 Testando funções RPC...');
  const functionsToTest = [
    { name: 'get_dashboard_stats', params: null },
    { name: 'get_user_role', params: null },
    { name: 'admin_get_users_count', params: null }
  ];
  
  for (const func of functionsToTest) {
    try {
      const { data, error } = await supabase.rpc(func.name, func.params);
      
      if (error) {
        console.log(`❌ ${func.name}: ${error.message}`);
        results.functions.failed++;
      } else {
        console.log(`✅ ${func.name}: OK`);
        results.functions.success++;
      }
    } catch (err) {
      console.log(`❌ ${func.name}: ${err.message}`);
      results.functions.failed++;
    }
  }
  
  // 3. Testar view users especificamente
  console.log('\n👥 Testando view users...');
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (usersError) {
      console.log(`❌ View users: ${usersError.message}`);
      results.views.failed++;
    } else {
      console.log(`✅ View users: OK`);
      if (usersData && usersData.length > 0) {
        console.log(`   Colunas disponíveis: ${Object.keys(usersData[0]).join(', ')}`);
      }
      results.views.success++;
    }
  } catch (err) {
    console.log(`❌ View users: ${err.message}`);
    results.views.failed++;
  }
  
  // 4. Testar inserção na tabela art_gallery
  console.log('\n🎨 Testando inserção na tabela art_gallery...');
  try {
    const { data, error } = await supabase
      .from('art_gallery')
      .insert({
        title: 'Teste de Migração',
        artist: 'Sistema de Teste',
        description: 'Obra criada para testar a migração',
        price: 100.00,
        category: 'ARTE_CONTEMPORANEA',
        dimensions: '10x10cm',
        year_created: 2025
      })
      .select();
    
    if (error) {
      console.log(`❌ Inserção art_gallery: ${error.message}`);
    } else {
      console.log(`✅ Inserção art_gallery: OK`);
      
      // Limpar o registro de teste
      if (data && data.length > 0) {
        await supabase
          .from('art_gallery')
          .delete()
          .eq('id', data[0].id);
        console.log(`   Registro de teste removido`);
      }
    }
  } catch (err) {
    console.log(`❌ Inserção art_gallery: ${err.message}`);
  }
  
  // 5. Resumo final
  console.log('\n📋 RESUMO DA MIGRAÇÃO:');
  console.log(`Tabelas: ${results.tables.success} ✅ | ${results.tables.failed} ❌`);
  console.log(`Funções: ${results.functions.success} ✅ | ${results.functions.failed} ❌`);
  console.log(`Views: ${results.views.success} ✅ | ${results.views.failed} ❌`);
  
  const totalSuccess = results.tables.success + results.functions.success + results.views.success;
  const totalFailed = results.tables.failed + results.functions.failed + results.views.failed;
  
  if (totalFailed === 0) {
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
  } else {
    console.log(`\n⚠️  MIGRAÇÃO PARCIALMENTE CONCLUÍDA: ${totalSuccess} sucessos, ${totalFailed} falhas`);
  }
}

testMigration();