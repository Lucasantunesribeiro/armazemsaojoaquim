#!/usr/bin/env node

/**
 * Script de Teste Específico do Supabase
 * Testa conexão e estrutura da tabela reservations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 TESTE ESPECÍFICO DO SUPABASE - ARMAZÉM SÃO JOAQUIM');
console.log('======================================================');
console.log(`🌐 Supabase URL: ${SUPABASE_URL || 'NÃO CONFIGURADO'}`);
console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
console.log(`🛡️  Service Key: ${SUPABASE_SERVICE_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
console.log('');

async function testSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.log('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
        console.log('');
        console.log('📋 Configure estas variáveis:');
        console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
        console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
        console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-key');
        process.exit(1);
    }

    // Testar com chave anônima
    console.log('🔍 TESTE 1: Conexão com chave anônima...');
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        const { data, error } = await supabaseAnon
            .from('reservations')
            .select('count(*)', { count: 'exact', head: true });
        
        if (error) {
            console.log(`❌ Erro com chave anônima: ${error.message}`);
            console.log(`   Código: ${error.code}`);
            console.log(`   Hint: ${error.hint || 'Nenhuma dica'}`);
        } else {
            console.log(`✅ Conexão anônima OK - Reservas existentes: ${data || 0}`);
        }
    } catch (err) {
        console.log(`❌ Erro de rede: ${err.message}`);
    }

    // Testar com chave de serviço (se disponível)
    if (SUPABASE_SERVICE_KEY) {
        console.log('');
        console.log('🔍 TESTE 2: Conexão com chave de serviço...');
        const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        try {
            // Verificar estrutura da tabela
            const { data: tableInfo, error: tableError } = await supabaseService
                .from('reservations')
                .select('*')
                .limit(1);

            if (tableError) {
                console.log(`❌ Erro ao verificar tabela: ${tableError.message}`);
                
                // Tentar verificar se a tabela existe
                const { data: tables, error: listError } = await supabaseService
                    .from('information_schema.tables')
                    .select('table_name')
                    .eq('table_schema', 'public')
                    .eq('table_name', 'reservations');

                if (listError) {
                    console.log(`❌ Erro ao listar tabelas: ${listError.message}`);
                } else if (!tables || tables.length === 0) {
                    console.log('❌ TABELA RESERVATIONS NÃO EXISTE!');
                    console.log('');
                    console.log('🚀 SOLUÇÃO: Execute a migração SQL:');
                    console.log('   1. Acesse app.supabase.com');
                    console.log('   2. Vá para SQL Editor');
                    console.log('   3. Execute o arquivo: supabase/migrations/001_create_reservations_table.sql');
                } else {
                    console.log('✅ Tabela reservations existe');
                }
            } else {
                console.log('✅ Conexão com chave de serviço OK');
                console.log(`✅ Tabela acessível - Estrutura válida`);
            }
        } catch (err) {
            console.log(`❌ Erro de rede com service key: ${err.message}`);
        }
    }

    // Teste de autenticação básica
    console.log('');
    console.log('🔍 TESTE 3: Verificando políticas RLS...');
    
    try {
        const { data: auth, error: authError } = await supabaseAnon.auth.getSession();
        console.log(`📊 Status da sessão: ${auth?.session ? 'AUTENTICADO' : 'ANÔNIMO'}`);
        
        if (!auth?.session) {
            console.log('⚠️  Usuário não autenticado - RLS pode bloquear operações');
            console.log('   Isso é normal para testes, mas pode causar erro 500 na API');
        }
    } catch (err) {
        console.log(`❌ Erro ao verificar auth: ${err.message}`);
    }

    // Teste final - simular requisição da API
    console.log('');
    console.log('🔍 TESTE 4: Simulando requisição POST da API...');
    
    try {
        const testReservation = {
            user_id: '00000000-0000-0000-0000-000000000000', // UUID fake
            nome: 'Teste API',
            email: 'teste@example.com',
            telefone: '(11) 99999-9999',
            data: '2024-12-25',
            horario: '19:00',
            pessoas: 2,
            observacoes: 'Teste de API'
        };

        const { data, error } = await supabaseAnon
            .from('reservations')
            .insert(testReservation)
            .select()
            .single();

        if (error) {
            console.log(`❌ Erro ao inserir teste: ${error.message}`);
            console.log(`   Código: ${error.code}`);
            console.log(`   Hint: ${error.hint || 'Nenhuma dica'}`);
            
            // Analisar o tipo de erro
            if (error.code === '42P01') {
                console.log('🔥 CAUSA: Tabela não existe - Execute a migração!');
            } else if (error.code === '42501') {
                console.log('🔥 CAUSA: Política RLS bloqueando - Verifique RLS policies');
            } else if (error.message.includes('JWT')) {
                console.log('🔥 CAUSA: Problema de autenticação - Verifique chaves');
            }
        } else {
            console.log('✅ Insert de teste funcionou!');
            console.log(`   ID criado: ${data.id}`);
            
            // Limpar teste
            await supabaseAnon.from('reservations').delete().eq('id', data.id);
            console.log('🧹 Registro de teste removido');
        }
    } catch (err) {
        console.log(`❌ Erro na simulação: ${err.message}`);
    }

    console.log('');
    console.log('========================================');
    console.log('📋 RESUMO DO DIAGNÓSTICO:');
    console.log('========================================');
}

testSupabase().catch(console.error); 