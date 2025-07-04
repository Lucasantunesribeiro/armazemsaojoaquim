import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE_KEY)

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const EMAIL = 'armazemsaojoaquimoficial@gmail.com'
const PASSWORD = '123456'
const ROLE = 'admin'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env.local')
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
    console.error('Erro ao buscar usuário:', fetchError)
    process.exit(1)
  }

  if (users && users.length > 0) {
    // Usuário já existe, atualiza role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: ROLE })
      .eq('email', EMAIL)
    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError)
      process.exit(1)
    }
    console.log('Usuário atualizado para admin com sucesso!')
  } else {
    // Usuário não existe, cria novo
    // Aqui seria necessário criar o usuário no auth também, mas mantive o fluxo original
    console.error('Usuário não encontrado. Crie o usuário pelo fluxo de autenticação primeiro.')
    process.exit(1)
  }
}

upsertUser() 