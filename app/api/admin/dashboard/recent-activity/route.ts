import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📊 [DASHBOARD-RECENT-ACTIVITY] Coletando atividades recentes...')
      
      const supabase = await createServerClient()

    // Simular atividades recentes
    const recentActivities = [
      {
        id: '1',
        type: 'user',
        title: 'Novo usuário cadastrado',
        description: 'João Silva se cadastrou no sistema',
        time: 'há 2 horas',
        status: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'blog',
        title: 'Post publicado',
        description: 'Artigo "História da Pousada" foi publicado',
        time: 'há 4 horas',
        status: 'info',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'reservation',
        title: 'Nova reserva',
        description: 'Reserva para o quarto Deluxe em março',
        time: 'há 6 horas',
        status: 'success',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'system',
        title: 'Backup realizado',
        description: 'Backup automático do sistema concluído',
        time: 'há 12 horas',
        status: 'info',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        type: 'user',
        title: 'Perfil atualizado',
        description: 'Maria Santos atualizou suas informações',
        time: 'há 1 dia',
        status: 'info',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        type: 'blog',
        title: 'Post editado',
        description: 'Artigo "Gastronomia Local" foi atualizado',
        time: 'há 2 dias',
        status: 'info',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Ordenar por timestamp (mais recente primeiro)
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      console.log('✅ [DASHBOARD-RECENT-ACTIVITY] Atividades coletadas com sucesso')

      return NextResponse.json({ 
        success: true, 
        data: recentActivities.slice(0, 10) // Limitar a 10 itens
      })
      
    } catch (error) {
      console.error('💥 [DASHBOARD-RECENT-ACTIVITY] Erro interno:', error)
      throw error
    }
  }, request)
}