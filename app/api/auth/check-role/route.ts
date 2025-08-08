import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const ADMIN_EMAIL = 'armazemsaojoaquimoficial@gmail.com'

export async function GET() {
  try {
    console.log('🔍 AUTH-CHECK-ROLE: Starting verification...')
    
    const supabase = await createServerClient()
    
    // Get active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.log('❌ AUTH-CHECK-ROLE: No active session:', sessionError?.message)
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'No active session',
        debug: { sessionError: sessionError?.message }
      })
    }

    const userId = session.user.id
    const email = session.user.email || ''
    
    console.log('✅ AUTH-CHECK-ROLE: Active session found for:', email)

    // Primary verification: Admin email check
    if (email === ADMIN_EMAIL) {
      console.log('✅ AUTH-CHECK-ROLE: Admin access by email verification')
      
      // Ensure admin profile exists
      try {
        await supabase.rpc('ensure_admin_profile', {
          admin_id: userId,
          admin_email: email,
          admin_name: 'Administrador Armazém São Joaquim'
        })
        console.log('✅ AUTH-CHECK-ROLE: Admin profile ensured')
      } catch (profileError) {
        console.warn('⚠️ AUTH-CHECK-ROLE: Could not ensure admin profile:', profileError)
      }
      
      return NextResponse.json({ 
        isAdmin: true,
        user: {
          id: userId,
          email: email,
          full_name: 'Administrador Armazém São Joaquim',
          role: 'admin'
        },
        source: 'email',
        method: 'direct_email_check'
      })
    }

    // Secondary verification: Check profile in database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email, full_name')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.log('❌ AUTH-CHECK-ROLE: Profile error:', profileError.message)
      
      // Try by email as fallback
      const { data: emailProfile, error: emailError } = await supabase
        .from('profiles')
        .select('role, email, full_name')
        .eq('email', email)
        .single()
      
      if (emailError) {
        console.log('❌ AUTH-CHECK-ROLE: Email profile not found either')
        return NextResponse.json({ 
          isAdmin: false, 
          error: 'Profile not found',
          debug: { 
            profileError: profileError.message,
            emailError: emailError.message 
          }
        })
      }
      
      // Use email profile
      const isAdmin = emailProfile.role === 'admin'
      console.log('✅ AUTH-CHECK-ROLE: Found by email. Admin:', isAdmin)
      
      return NextResponse.json({ 
        isAdmin,
        user: {
          id: userId,
          email: emailProfile.email,
          full_name: emailProfile.full_name || email,
          role: emailProfile.role
        },
        source: 'email_profile',
        method: 'email_profile_lookup'
      })
    }

    const isAdmin = profile.role === 'admin'
    console.log(`✅ AUTH-CHECK-ROLE: Profile found. Role: ${profile.role}, Admin: ${isAdmin}`)
    
    return NextResponse.json({ 
      isAdmin,
      user: {
        id: userId,
        email: profile.email || email,
        full_name: profile.full_name || email,
        role: profile.role
      },
      source: 'profile',
      method: 'profile_lookup'
    })
    
  } catch (error: any) {
    console.error('❌ AUTH-CHECK-ROLE: Internal server error:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Internal server error',
      debug: { error: error.message }
    }, { status: 500 })
  }
}