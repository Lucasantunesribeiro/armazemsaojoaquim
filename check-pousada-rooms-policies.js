const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function checkPousadaRoomsPolicies() {
  console.log('🔍 Checking Pousada Rooms RLS Policies...\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Check RLS policies on pousada_rooms table
  console.log('1️⃣ Checking RLS policies...')
  
  try {
    // Query to get RLS policies for pousada_rooms table
    let policies, policiesError
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname, 
            tablename, 
            policyname, 
            permissive, 
            roles, 
            cmd, 
            qual, 
            with_check 
          FROM pg_policies 
          WHERE tablename = 'pousada_rooms' 
          ORDER BY policyname;
        `
      })
      policies = result.data
      policiesError = result.error
    } catch (rpcError) {
      console.log('RPC failed, trying fallback...')
      policies = null
      policiesError = 'RPC not available'
    }
    
    if (policiesError || !policies) {
      console.log('❌ Could not retrieve policies:', policiesError?.message || 'RPC not available')
      
      // Try to test the table directly with service role
      console.log('\n2️⃣ Testing table access with service role...')
      
      const { data: rooms, error: roomsError } = await supabase
        .from('pousada_rooms')
        .select('*')
        .limit(1)
      
      if (roomsError) {
        console.log('❌ Service role access failed:', roomsError.message)
        
        if (roomsError.message.includes('permission denied for table users')) {
          console.log('\n🚨 ISSUE IDENTIFIED: RLS policies are referencing a "users" table that doesn\'t exist or has permission issues')
          console.log('\n🔧 SOLUTION: We need to fix the RLS policies to not reference the users table')
          
          // Try to fix the policies
          console.log('\n3️⃣ Attempting to fix RLS policies...')
          
          const fixPoliciesSQL = `
            -- Drop existing policies
            DROP POLICY IF EXISTS "pousada_rooms_select_policy" ON public.pousada_rooms;
            DROP POLICY IF EXISTS "pousada_rooms_admin_policy" ON public.pousada_rooms;
            
            -- Create simple policies that don't reference users table
            CREATE POLICY "pousada_rooms_public_select" ON public.pousada_rooms
              FOR SELECT USING (true);
            
            CREATE POLICY "pousada_rooms_admin_all" ON public.pousada_rooms
              FOR ALL USING (
                auth.email() = 'armazemsaojoaquimoficial@gmail.com' OR
                EXISTS (
                  SELECT 1 FROM public.profiles 
                  WHERE id = auth.uid() AND role = 'admin'
                )
              );
          `
          
          try {
            let fixError
            try {
              const result = await supabase.rpc('exec_sql', { sql: fixPoliciesSQL })
              fixError = result.error
            } catch (rpcError) {
              fixError = 'RPC not available'
            }
            
            if (fixError) {
              console.log('❌ Failed to fix policies via RPC:', fixError)
              
              // Try manual policy creation
              console.log('Trying manual policy fix...')
              
              // Drop existing policies
              await supabase.rpc('exec_sql', { 
                sql: 'DROP POLICY IF EXISTS "pousada_rooms_select_policy" ON public.pousada_rooms;' 
              }).catch(() => {})
              
              await supabase.rpc('exec_sql', { 
                sql: 'DROP POLICY IF EXISTS "pousada_rooms_admin_policy" ON public.pousada_rooms;' 
              }).catch(() => {})
              
              // Create new simple policies
              await supabase.rpc('exec_sql', { 
                sql: 'CREATE POLICY "pousada_rooms_public_select" ON public.pousada_rooms FOR SELECT USING (true);' 
              }).catch(() => {})
              
              await supabase.rpc('exec_sql', { 
                sql: `CREATE POLICY "pousada_rooms_admin_all" ON public.pousada_rooms FOR ALL USING (auth.email() = 'armazemsaojoaquimoficial@gmail.com');` 
              }).catch(() => {})
              
              console.log('✅ Manual policy fix attempted')
            } else {
              console.log('✅ Policies fixed successfully')
            }
            
            // Test again
            console.log('\n4️⃣ Testing table access after fix...')
            
            const { data: testRooms, error: testError } = await supabase
              .from('pousada_rooms')
              .select('*')
              .limit(1)
            
            if (testError) {
              console.log('❌ Still failing after fix:', testError.message)
            } else {
              console.log('✅ Table access working after fix!')
              console.log(`   Found ${testRooms.length} rooms`)
            }
            
          } catch (fixError) {
            console.log('❌ Error during policy fix:', fixError.message)
          }
        }
      } else {
        console.log('✅ Service role access works')
        console.log(`   Found ${rooms.length} rooms`)
      }
    } else {
      console.log('✅ Retrieved RLS policies:')
      policies.forEach((policy, index) => {
        console.log(`   ${index + 1}. ${policy.policyname}`)
        console.log(`      Command: ${policy.cmd}`)
        console.log(`      Condition: ${policy.qual || 'N/A'}`)
        console.log(`      Check: ${policy.with_check || 'N/A'}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
  
  console.log('\n🎉 Policy check completed!')
}

checkPousadaRoomsPolicies().catch(console.error)