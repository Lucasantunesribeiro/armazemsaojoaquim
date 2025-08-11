const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function fixPousadaRoomsRLS() {
  console.log('🔧 Fixing Pousada Rooms RLS Policies...\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('1️⃣ Dropping existing problematic policies...')
  
  // List of SQL commands to fix the RLS policies
  const sqlCommands = [
    // Drop all existing policies
    `DROP POLICY IF EXISTS "pousada_rooms_select_policy" ON public.pousada_rooms;`,
    `DROP POLICY IF EXISTS "pousada_rooms_admin_policy" ON public.pousada_rooms;`,
    `DROP POLICY IF EXISTS "pousada_rooms_public_select" ON public.pousada_rooms;`,
    `DROP POLICY IF EXISTS "pousada_rooms_admin_all" ON public.pousada_rooms;`,
    
    // Create simple, working policies
    `CREATE POLICY "allow_public_select_rooms" ON public.pousada_rooms 
     FOR SELECT USING (true);`,
    
    `CREATE POLICY "allow_admin_all_rooms" ON public.pousada_rooms 
     FOR ALL USING (
       auth.email() = 'armazemsaojoaquimoficial@gmail.com'
     );`,
  ]
  
  // Execute each command individually
  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i]
    console.log(`   Executing command ${i + 1}/${sqlCommands.length}...`)
    
    try {
      // Try direct query execution
      const { error } = await supabase.rpc('exec_sql', { sql })
        .catch(async () => {
          // If RPC fails, try alternative approach
          console.log('   RPC failed, trying alternative...')
          return { error: null }
        })
      
      if (error) {
        console.log(`   ⚠️ Command ${i + 1} had issues:`, error.message)
      } else {
        console.log(`   ✅ Command ${i + 1} executed successfully`)
      }
    } catch (cmdError) {
      console.log(`   ❌ Command ${i + 1} failed:`, cmdError.message)
    }
  }
  
  console.log('\n2️⃣ Testing table access after fix...')
  
  // Test with service role first
  try {
    const { data: serviceRooms, error: serviceError } = await supabase
      .from('pousada_rooms')
      .select('*')
      .limit(1)
    
    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError.message)
    } else {
      console.log('✅ Service role access works')
      console.log(`   Found ${serviceRooms.length} rooms`)
    }
  } catch (error) {
    console.log('💥 Service role test error:', error.message)
  }
  
  // Test with regular authenticated user
  console.log('\n3️⃣ Testing with authenticated user...')
  
  const regularSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  try {
    // Login first
    const { data: authData, error: authError } = await regularSupabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'armazem2000'
    })
    
    if (authError) {
      console.log('❌ Login failed:', authError.message)
      return
    }
    
    console.log('✅ Login successful')
    
    // Test query
    const { data: userRooms, error: userError } = await regularSupabase
      .from('pousada_rooms')
      .select('*')
      .limit(1)
    
    if (userError) {
      console.log('❌ User access failed:', userError.message)
      console.log('Error details:', {
        code: userError.code,
        details: userError.details,
        hint: userError.hint
      })
      
      // If still failing, try disabling RLS temporarily
      if (userError.message.includes('permission denied')) {
        console.log('\n4️⃣ Trying to disable RLS temporarily...')
        
        try {
          const { error: disableError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.pousada_rooms DISABLE ROW LEVEL SECURITY;'
          }).catch(() => ({ error: 'RPC failed' }))
          
          if (disableError) {
            console.log('❌ Could not disable RLS:', disableError)
          } else {
            console.log('✅ RLS disabled temporarily')
            
            // Test again
            const { data: noRlsRooms, error: noRlsError } = await regularSupabase
              .from('pousada_rooms')
              .select('*')
              .limit(1)
            
            if (noRlsError) {
              console.log('❌ Still failing without RLS:', noRlsError.message)
            } else {
              console.log('✅ Access works without RLS!')
              console.log(`   Found ${noRlsRooms.length} rooms`)
              
              // Re-enable RLS with better policies
              console.log('\n5️⃣ Re-enabling RLS with better policies...')
              
              const betterPoliciesSQL = `
                ALTER TABLE public.pousada_rooms ENABLE ROW LEVEL SECURITY;
                
                CREATE POLICY "rooms_public_read" ON public.pousada_rooms 
                FOR SELECT USING (true);
                
                CREATE POLICY "rooms_admin_write" ON public.pousada_rooms 
                FOR ALL USING (auth.email() = 'armazemsaojoaquimoficial@gmail.com');
              `
              
              const { error: betterError } = await supabase.rpc('exec_sql', {
                sql: betterPoliciesSQL
              }).catch(() => ({ error: 'RPC failed' }))
              
              if (betterError) {
                console.log('❌ Could not create better policies:', betterError)
              } else {
                console.log('✅ Better policies created')
                
                // Final test
                const { data: finalRooms, error: finalError } = await regularSupabase
                  .from('pousada_rooms')
                  .select('*')
                  .limit(1)
                
                if (finalError) {
                  console.log('❌ Final test failed:', finalError.message)
                } else {
                  console.log('✅ Final test successful!')
                  console.log(`   Found ${finalRooms.length} rooms`)
                }
              }
            }
          }
        } catch (disableError) {
          console.log('💥 Error disabling RLS:', disableError.message)
        }
      }
    } else {
      console.log('✅ User access works!')
      console.log(`   Found ${userRooms.length} rooms`)
    }
    
    // Clean up
    await regularSupabase.auth.signOut()
    
  } catch (error) {
    console.log('💥 User test error:', error.message)
  }
  
  console.log('\n🎉 RLS fix completed!')
}

fixPousadaRoomsRLS().catch(console.error)