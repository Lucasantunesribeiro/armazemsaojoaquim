'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export function useAdmin() {
  const { user, supabase } = useSupabase()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        // Primeiro verificar por email (mais rápido e sem RLS)
        if (user.email === 'armazemsaojoaquimoficial@gmail.com') {
          console.log('✅ useAdmin: Usuário é admin por email')
          setIsAdmin(true)
          setLoading(false)
          return
        }

        // Fallback: verificar role no banco (pode falhar se RLS estiver mal configurado)
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          if (error) {
            console.warn('⚠️ useAdmin: Erro ao verificar role (RLS issue):', error.message)
            // Se der erro de RLS, assumir que não é admin
            setIsAdmin(false)
          } else {
            const isAdminByRole = data?.role === 'admin'
            console.log('✅ useAdmin: Verificação por role:', isAdminByRole)
            setIsAdmin(isAdminByRole)
          }
        } catch (roleError) {
          console.warn('⚠️ useAdmin: Falha na verificação por role:', roleError)
          // Se der erro, assumir que não é admin
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ useAdmin: Erro geral na verificação:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, supabase])

  return { isAdmin, loading }
}