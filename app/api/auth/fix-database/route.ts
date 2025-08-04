import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando correção do banco de dados...')
    
    // 1. Verificar se a tabela profiles existe
    const { data: profilesExists, error: checkError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (checkError && checkError.message.includes('relation "profiles" does not exist')) {
      console.log('❌ Tabela profiles não existe - criando...')
      
      // Criar tabela profiles
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          phone TEXT,
          address TEXT,
          role VARCHAR(20) DEFAULT 'user' NOT NULL,
          preferences JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
        
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
          FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Admins podem ver todos os perfis" ON profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM auth.users
              WHERE auth.uid() = id
              AND raw_user_meta_data->>'role' = 'admin'
            )
          );
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      })
      
      if (createError) {
        console.error('❌ Erro ao criar tabela profiles:', createError)
        return NextResponse.json({ 
          success: false, 
          error: 'Erro ao criar tabela profiles' 
        }, { status: 500 })
      }
    }
    
    // 2. Criar view users se não existir
    const createViewSQL = `
      CREATE OR REPLACE VIEW users AS SELECT * FROM profiles;
    `
    
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: createViewSQL
    })
    
    if (viewError) {
      console.error('❌ Erro ao criar view users:', viewError)
    }
    
    // 3. Corrigir função handle_new_user
    const fixFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          COALESCE(NEW.raw_user_meta_data->>'role', 'user')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: fixFunctionSQL
    })
    
    if (functionError) {
      console.error('❌ Erro ao corrigir função handle_new_user:', functionError)
    }
    
    // 4. Remover triggers duplicados e criar o correto
    const fixTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
      
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `
    
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: fixTriggerSQL
    })
    
    if (triggerError) {
      console.error('❌ Erro ao corrigir triggers:', triggerError)
    }
    
    // 5. Criar perfis para usuários existentes que não têm
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (!listError && authUsers?.users) {
      for (const user of authUsers.users) {
        // Verificar se o usuário já tem perfil
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!existingProfile) {
          console.log(`📝 Criando perfil para usuário: ${user.email}`)
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              role: user.user_metadata?.role || 'user'
            })
          
          if (insertError) {
            console.error(`❌ Erro ao criar perfil para ${user.email}:`, insertError)
          }
        }
      }
    }
    
    // 6. Verificar status final
    const { data: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log('✅ Correção concluída!')
    console.log(`📊 Total de perfis: ${profilesCount?.length || 0}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Banco de dados corrigido com sucesso',
      profilesCount: profilesCount?.length || 0
    })
    
  } catch (error: any) {
    console.error('❌ Erro durante correção:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 