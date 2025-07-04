import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const EMAIL = 'armazemsaojoaquimoficial@gmail.com'
const PASSWORD = '123456'
const ROLE = 'admin'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function upsertUser() {
  // Verifica se o usuário já existe
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', EMAIL)

  if (fetchError) {
    console.error('❌ Erro ao buscar usuário:', fetchError)
    process.exit(1)
  }

  const password_hash = await bcrypt.hash(PASSWORD, 10)

  if (users && users.length > 0) {
    // Usuário já existe, atualizar senha e role
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash, role: ROLE })
      .eq('email', EMAIL)
    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError)
      process.exit(1)
    }
    console.log('✅ Usuário atualizado com sucesso!')
  } else {
    // Usuário não existe, criar
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ email: EMAIL, password_hash, role: ROLE }])
    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError)
      process.exit(1)
    }
    console.log('✅ Usuário criado com sucesso!')
  }
}

upsertUser() 