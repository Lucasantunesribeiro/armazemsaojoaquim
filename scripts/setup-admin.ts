import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { hash } from 'bcryptjs'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdminUser() {
  const adminEmail = 'armazemsaojoaquim@gmail.com'
  const adminPassword = '123456'
  const adminName = 'Administrador Armazém São Joaquim'
  
  console.log('🔧 Setting up admin user...')
  
  try {
    // First, check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError)
      return
    }
    
    const existingAuthUser = authUsers.users.find(user => user.email === adminEmail)
    let userId: string
    
    if (existingAuthUser) {
      console.log('📧 Found existing auth user')
      userId = existingAuthUser.id
      
      // Update password if needed
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        existingAuthUser.id,
        { password: adminPassword }
      )
      
      if (updateAuthError) {
        console.error('❌ Error updating auth user password:', updateAuthError)
        return
      }
      
      console.log('✅ Updated auth user password')
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      })
      
      if (authError) {
        console.error('❌ Error creating auth user:', authError)
        return
      }
      
      userId = authData.user.id
      console.log('✅ Created new auth user')
    }
    
    // Now handle the users table
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single()
    
    if (existingUser) {
      // Update existing user to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          name: adminName,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
      
      if (updateError) {
        console.error('❌ Error updating user role:', updateError)
        return
      }
      
      console.log('✅ Updated existing user to admin role')
    } else {
      // Insert user into users table
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: adminEmail,
          name: adminName,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('❌ Error inserting user:', insertError)
        return
      }
      
      console.log('✅ Created new user record')
    }
    
    console.log(`
📧 Admin Email: ${adminEmail}
🔑 Admin Password: ${adminPassword}
🚀 Admin setup complete!

⚠️  IMPORTANT: Change the password after first login!
    `)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the setup
setupAdminUser()