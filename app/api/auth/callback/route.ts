import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', error, errorDescription)
    const redirectUrl = new URL('/pt/auth', origin)
    redirectUrl.searchParams.set('error', error)
    redirectUrl.searchParams.set('message', errorDescription || 'Erro na autenticação OAuth')
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    try {
      // NEXT.JS 15: createServerClient agora é async
      const supabase = await createServerClient()
      
      // Exchange code for session
      const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        const redirectUrl = new URL('/pt/auth', origin)
        redirectUrl.searchParams.set('error', 'exchange_failed')
        redirectUrl.searchParams.set('message', 'Falha na troca do código de autorização')
        return NextResponse.redirect(redirectUrl)
      }

      if (session) {
        console.log('✅ OAuth session created successfully')
        
        // Check if user is admin
        const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
        const isUserAdmin = adminEmails.includes(session.user.email || '')
        
        // Determine redirect path
        let redirectPath = '/pt'
        
        if (isUserAdmin) {
          redirectPath = '/pt/admin'
        } else if (next && next !== '/') {
          redirectPath = next
        }
        
        const redirectUrl = new URL(redirectPath, origin)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      const redirectUrl = new URL('/pt/auth', origin)
      redirectUrl.searchParams.set('error', 'callback_error')
      redirectUrl.searchParams.set('message', 'Erro inesperado no callback de autenticação')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no code, redirect to auth page
  const redirectUrl = new URL('/pt/auth', origin)
  redirectUrl.searchParams.set('error', 'missing_code')
  redirectUrl.searchParams.set('message', 'Código de autorização não encontrado')
  return NextResponse.redirect(redirectUrl)
}

// Handle password recovery
export async function POST(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const type = searchParams.get('type')
  
  if (type === 'recovery') {
    try {
      const formData = await request.formData()
      const password = formData.get('password') as string
      
      if (!password) {
        const redirectUrl = new URL('/pt/auth', origin)
        redirectUrl.searchParams.set('error', 'missing_password')
        redirectUrl.searchParams.set('message', 'Nova senha é obrigatória')
        return NextResponse.redirect(redirectUrl)
      }

      // NEXT.JS 15: createServerClient agora é async
      const supabase = await createServerClient()
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update error:', error)
        const redirectUrl = new URL('/pt/auth', origin)
        redirectUrl.searchParams.set('error', 'update_failed')
        redirectUrl.searchParams.set('message', 'Falha ao atualizar senha')
        return NextResponse.redirect(redirectUrl)
      }

      console.log('✅ Password updated successfully')
      const redirectUrl = new URL('/pt/auth', origin)
      redirectUrl.searchParams.set('message', 'Senha atualizada com sucesso')
      return NextResponse.redirect(redirectUrl)
      
    } catch (error) {
      console.error('Recovery error:', error)
      const redirectUrl = new URL('/pt/auth', origin)
      redirectUrl.searchParams.set('error', 'recovery_error')
      redirectUrl.searchParams.set('message', 'Erro inesperado na recuperação de senha')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL('/pt/auth', origin))
}
