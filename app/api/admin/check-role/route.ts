import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const ADMIN_EMAIL = 'armazemsaojoaquimoficial@gmail.com'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ADMIN-CHECK-ROLE: Starting verification...')
    
    // Get session from cookies
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.log('❌ ADMIN-CHECK-ROLE: No active session')
      return NextResponse.json({ 
        isAdmin: false,
        method: 'no_session',
        error: 'No active session',
        debug: { sessionError: sessionError?.message }
      })
    }

    const userId = session.user.id
    const email = session.user.email || ''
    
    console.log('✅ ADMIN-CHECK-ROLE: Session found for:', email)

    // Primary verification: Admin email check
    if (email === ADMIN_EMAIL) {
      console.log('✅ ADMIN-CHECK-ROLE: Admin confirmed by email')
      
      // Ensure admin profile exists in database
      try {
        await supabase.rpc('ensure_admin_profile', {
          admin_id: userId,
          admin_email: email,
          admin_name: 'Administrador Armazém São Joaquim'
        })
        console.log('✅ ADMIN-CHECK-ROLE: Admin profile ensured')
      } catch (profileError) {
        console.warn('⚠️ ADMIN-CHECK-ROLE: Could not ensure admin profile:', profileError)
      }
      
      return NextResponse.json({ 
        isAdmin: true,
        method: 'email_verification',
        role: 'admin',
        user: {
          id: userId,
          email: email,
          full_name: 'Administrador Armazém São Joaquim',
          role: 'admin'
        }
      })
    }

    // Secondary verification: Database role check
    console.log('🔍 ADMIN-CHECK-ROLE: Checking database role for:', email)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email, full_name')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.log('❌ ADMIN-CHECK-ROLE: Profile not found:', profileError.message)
      
      // Try by email as fallback
      const { data: emailProfile, error: emailError } = await supabase
        .from('profiles')
        .select('role, email, full_name')
        .eq('email', email)
        .single()
      
      if (emailError) {
        console.log('❌ ADMIN-CHECK-ROLE: Email profile not found either')
        return NextResponse.json({ 
          isAdmin: false,
          method: 'profile_not_found',
          error: 'Profile not found',
          debug: { 
            profileError: profileError.message,
            emailError: emailError.message 
          }
        })
      }
      
      // Use email profile
      const isAdmin = emailProfile.role === 'admin'
      console.log('✅ ADMIN-CHECK-ROLE: Found by email. Admin:', isAdmin)
      
      return NextResponse.json({ 
        isAdmin,
        method: 'email_profile_lookup',
        role: emailProfile.role,
        user: {
          id: userId,
          email: emailProfile.email,
          full_name: emailProfile.full_name || 'Usuário',
          role: emailProfile.role
        }
      })
    }

    const isAdmin = profile.role === 'admin'
    console.log('✅ ADMIN-CHECK-ROLE: Database check complete. Admin:', isAdmin)
    
    return NextResponse.json({ 
      isAdmin,
      method: 'database_lookup',
      role: profile.role,
      user: {
        id: userId,
        email: profile.email,
        full_name: profile.full_name || 'Usuário',
        role: profile.role
      }
    })
    
  } catch (error: any) {
    console.error('❌ ADMIN-CHECK-ROLE: Internal server error:', error)
    return NextResponse.json({ 
      isAdmin: false,
      method: 'error',
      error: 'Internal server error',
      debug: { error: error.message }
    }, { status: 500 })
  }
}