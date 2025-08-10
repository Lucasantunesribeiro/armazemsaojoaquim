const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testPousadaRoomsDirect() {
  console.log('🧪 Testing Pousada Rooms Direct Query...\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Step 1: Login as admin
  console.log('1️⃣ Logging in as admin...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'armazemsaojoaquimoficial@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'armazem2000'
  })
  
  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  
  console.log('✅ Login successful')
  
  // Step 2: Test direct query to pousada_rooms
  console.log('\n2️⃣ Testing direct query to pousada_rooms...')
  
  try {
    const { data: rooms, error: roomsError } = await supabase
      .from('pousada_rooms')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (roomsError) {
      console.error('❌ Direct query failed:', roomsError)
      console.log('Error details:', {
        message: roomsError.message,
        details: roomsError.details,
        hint: roomsError.hint,
        code: roomsError.code
      })
    } else {
      console.log('✅ Direct query successful')
      console.log(`   Found ${rooms.length} rooms`)
      rooms.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.name} (${room.type}) - R$ ${room.price_refundable}`)
      })
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
  
  // Step 3: Test with filters (like the API endpoint does)
  console.log('\n3️⃣ Testing query with filters...')
  
  try {
    let query = supabase
      .from('pousada_rooms')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Test type filter
    const typeFilter = 'STANDARD'
    if (typeFilter && typeFilter !== 'all') {
      query = query.eq('type', typeFilter.toUpperCase())
    }
    
    const { data: filteredRooms, error: filterError } = await query
    
    if (filterError) {
      console.error('❌ Filtered query failed:', filterError)
    } else {
      console.log('✅ Filtered query successful')
      console.log(`   Found ${filteredRooms.length} rooms with type ${typeFilter}`)
    }
  } catch (error) {
    console.error('💥 Filtered query error:', error.message)
  }
  
  // Step 4: Test RLS policies
  console.log('\n4️⃣ Testing RLS policies...')
  
  try {
    // Test without authentication (should work for SELECT)
    const supabaseNoAuth = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: publicRooms, error: publicError } = await supabaseNoAuth
      .from('pousada_rooms')
      .select('*')
      .limit(1)
    
    if (publicError) {
      console.log('❌ Public access failed (this might be expected):', publicError.message)
    } else {
      console.log('✅ Public access works')
      console.log(`   Found ${publicRooms.length} rooms without auth`)
    }
  } catch (error) {
    console.error('💥 RLS test error:', error.message)
  }
  
  // Step 5: Test the exact same query as the API endpoint
  console.log('\n5️⃣ Testing exact API endpoint query...')
  
  try {
    // Simulate the exact query from the API endpoint
    const searchParams = new URLSearchParams()
    // No filters for this test
    
    let query = supabase
      .from('pousada_rooms')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters (none in this test)
    const type = null
    const available = null
    const search = null

    if (type && type !== 'all') {
      query = query.eq('type', type.toUpperCase())
    }

    if (available && available !== 'all') {
      query = query.eq('available', available === 'true')
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: apiRooms, error: apiError } = await query

    if (apiError) {
      console.error('❌ API-style query failed:', apiError)
      console.log('Error details:', {
        message: apiError.message,
        details: apiError.details,
        hint: apiError.hint,
        code: apiError.code
      })
    } else {
      console.log('✅ API-style query successful')
      console.log(`   Found ${apiRooms.length} rooms`)
      console.log('   Sample room:', apiRooms[0] ? {
        id: apiRooms[0].id,
        name: apiRooms[0].name,
        type: apiRooms[0].type,
        available: apiRooms[0].available
      } : 'No rooms found')
    }
  } catch (error) {
    console.error('💥 API-style query error:', error.message)
  }
  
  // Clean up
  await supabase.auth.signOut()
  console.log('\n🎉 Pousada rooms direct test completed!')
}

testPousadaRoomsDirect().catch(console.error)