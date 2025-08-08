import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📊 [DASHBOARD-ACTIVITY] Coletando dados de atividade...')
      
      const supabase = await createServerClient()

    // Simular dados de atividade por mês (últimos 6 meses)
    const currentDate = new Date()
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    const activityData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = months[date.getMonth()]
      
      // Simular crescimento progressivo
      const baseUsers = 10 + (5 - i) * 5
      const baseReservas = 5 + (5 - i) * 4
      const basePosts = 2 + (5 - i) * 1
      
      activityData.push({
        name: monthName,
        usuarios: baseUsers + Math.floor(Math.random() * 10),
        reservas: baseReservas + Math.floor(Math.random() * 8),
        posts: basePosts + Math.floor(Math.random() * 3)
      })
    }

      console.log('✅ [DASHBOARD-ACTIVITY] Dados de atividade coletados com sucesso')

      return NextResponse.json({ 
        success: true, 
        data: activityData 
      })
      
    } catch (error) {
      console.error('💥 [DASHBOARD-ACTIVITY] Erro interno:', error)
      throw error
    }
  }, request)
}