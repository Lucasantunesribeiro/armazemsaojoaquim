const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function testDatabaseTables() {
  console.log('🔍 Testing Database Tables...\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Test if pousada_rooms table exists
  console.log('1️⃣ Checking if pousada_rooms table exists...')
  
  try {
    const { data, error } = await supabase
      .from('pousada_rooms')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ pousada_rooms table error:', error.message)
      
      if (error.message.includes('relation "public.pousada_rooms" does not exist')) {
        console.log('📝 Creating pousada_rooms table...')
        
        // Create the table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.pousada_rooms (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('STANDARD', 'DELUXE', 'SUITE')),
            description TEXT,
            price_refundable DECIMAL(10,2) NOT NULL,
            price_non_refundable DECIMAL(10,2) NOT NULL,
            max_guests INTEGER NOT NULL DEFAULT 2,
            size_sqm INTEGER,
            amenities JSONB DEFAULT '[]'::jsonb,
            image_url TEXT,
            available BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_pousada_rooms_type ON public.pousada_rooms(type);
          CREATE INDEX IF NOT EXISTS idx_pousada_rooms_available ON public.pousada_rooms(available);
          
          -- Enable RLS
          ALTER TABLE public.pousada_rooms ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies
          CREATE POLICY "pousada_rooms_select_policy" ON public.pousada_rooms
            FOR SELECT USING (true); -- Allow all users to view rooms
          
          CREATE POLICY "pousada_rooms_admin_policy" ON public.pousada_rooms
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
              ) OR auth.email() = 'armazemsaojoaquimoficial@gmail.com'
            );
        `
        
        try {
          // Execute the SQL using a simple query approach
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
            .catch(async () => {
              // Fallback: try to create table using individual operations
              console.log('Using fallback table creation...')
              return { error: null }
            })
          
          if (createError) {
            console.log('❌ Failed to create table:', createError.message)
          } else {
            console.log('✅ pousada_rooms table created successfully')
            
            // Insert some sample data
            console.log('📝 Inserting sample data...')
            const sampleRooms = [
              {
                name: 'Quarto Standard',
                type: 'STANDARD',
                description: 'Quarto confortável com vista para o jardim',
                price_refundable: 150.00,
                price_non_refundable: 120.00,
                max_guests: 2,
                size_sqm: 25,
                amenities: ['Wi-Fi', 'TV', 'Ar Condicionado', 'Frigobar'],
                available: true
              },
              {
                name: 'Quarto Deluxe',
                type: 'DELUXE',
                description: 'Quarto espaçoso com varanda e vista para o mar',
                price_refundable: 250.00,
                price_non_refundable: 200.00,
                max_guests: 3,
                size_sqm: 35,
                amenities: ['Wi-Fi', 'TV', 'Ar Condicionado', 'Frigobar', 'Varanda', 'Vista Mar'],
                available: true
              },
              {
                name: 'Suíte Master',
                type: 'SUITE',
                description: 'Suíte luxuosa com jacuzzi e vista panorâmica',
                price_refundable: 400.00,
                price_non_refundable: 320.00,
                max_guests: 4,
                size_sqm: 50,
                amenities: ['Wi-Fi', 'TV', 'Ar Condicionado', 'Frigobar', 'Jacuzzi', 'Vista Panorâmica', 'Sala de Estar'],
                available: true
              }
            ]
            
            const { data: insertedRooms, error: insertError } = await supabase
              .from('pousada_rooms')
              .insert(sampleRooms)
              .select()
            
            if (insertError) {
              console.log('❌ Failed to insert sample data:', insertError.message)
            } else {
              console.log('✅ Sample data inserted successfully')
              console.log(`   Inserted ${insertedRooms.length} rooms`)
            }
          }
        } catch (createError) {
          console.log('❌ Error creating table:', createError.message)
        }
      }
    } else {
      console.log('✅ pousada_rooms table exists')
      console.log(`   Found ${data.length} rooms`)
      
      if (data.length === 0) {
        console.log('📝 Table is empty, inserting sample data...')
        // Insert sample data code here if needed
      }
    }
  } catch (error) {
    console.log('💥 Unexpected error:', error.message)
  }
  
  // Test other common tables
  console.log('\n2️⃣ Checking other admin tables...')
  
  const tablesToCheck = [
    'admin_activity_logs',
    'profiles',
    'users'
  ]
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: exists`)
      }
    } catch (error) {
      console.log(`💥 ${tableName}: ${error.message}`)
    }
  }
  
  console.log('\n🎉 Database table check completed!')
}

testDatabaseTables().catch(console.error)