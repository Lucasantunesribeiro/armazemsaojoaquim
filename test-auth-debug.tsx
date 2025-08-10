'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function TestAuthDebug() {
  const [authInfo, setAuthInfo] = useState<any>({})
  const [profileInfo, setProfileInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testAuth() {
      try {
        const supabase = createClient()
        
        console.log('🔍 Testing auth...')
        
        // Test 1: Get current session
        const { data: session, error: sessionError } = await supabase.auth.getSession()
        console.log('📱 Session:', { session: session?.session?.user?.email, error: sessionError })
        
        // Test 2: Get user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        console.log('👤 User:', { user: userData?.user?.email, error: userError })
        
        setAuthInfo({
          hasSession: !!session?.session,
          sessionUser: session?.session?.user?.email,
          sessionError: sessionError?.message,
          hasUser: !!userData?.user,
          userEmail: userData?.user?.email,
          userId: userData?.user?.id,
          userError: userError?.message
        })
        
        // Test 3: Try to query user_profiles with detailed logging
        if (userData?.user?.id) {
          console.log('🔍 Querying user_profiles for user ID:', userData.user.id)
          
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single()
          
          console.log('📊 Profile query result:', { profile, error: profileError })
          
          setProfileInfo({
            profile,
            error: profileError?.message,
            code: profileError?.code,
            details: profileError?.details,
            hint: profileError?.hint
          })
        }
        
      } catch (err) {
        console.error('💥 Test error:', err)
        setAuthInfo({ generalError: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    
    testAuth()
  }, [])

  if (loading) {
    return <div className="p-6">🔄 Testando autenticação...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🐞 Debug de Autenticação</h1>
      
      <div className="grid gap-6">
        {/* Auth Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Informações de Autenticação:</h2>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>
        
        {/* Profile Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Informações de Perfil:</h2>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(profileInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}