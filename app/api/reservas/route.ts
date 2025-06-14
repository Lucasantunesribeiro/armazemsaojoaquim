import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '../../../lib/email-service'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Configuração do Supabase com service role para operações administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Função para criar resposta JSON com headers CORS obrigatórios
function createJsonResponse(data: any, status: number = 200) {
  // Garante que sempre retornamos JSON válido
  const jsonData = typeof data === 'string' ? { message: data } : data
  
  return new NextResponse(JSON.stringify(jsonData), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return createJsonResponse({ message: 'CORS preflight successful' }, 200)
}

// GET - Buscar reservas do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase não configurado:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      })
      return createJsonResponse({
        error: 'Configuração do servidor incompleta',
        details: 'Supabase não está configurado corretamente'
      }, 500)
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Criar cliente Supabase com service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Se não há user_id, retorna lista vazia
    if (!userId) {
      return createJsonResponse({
        success: true,
        data: [],
        count: 0,
        message: 'Nenhuma reserva encontrada (user_id não fornecido)',
        usage: 'Para buscar reservas específicas: GET /api/reservas?user_id=USER_ID'
      }, 200)
    }

    // Buscar reservas do usuário no Supabase
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar reservas:', error)
      return createJsonResponse({
        error: 'Erro ao buscar reservas',
        details: error.message,
        code: error.code
      }, 500)
    }

    // Mapear dados para formato esperado pelo frontend
    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      user_id: reservation.user_id,
      nome: reservation.nome,
      email: reservation.email,
      telefone: reservation.telefone,
      data: reservation.data,
      horario: reservation.horario,
      pessoas: reservation.pessoas,
      status: reservation.status,
      observacoes: reservation.observacoes,
      created_at: reservation.created_at
    }))

    return createJsonResponse({
      success: true,
      data: formattedReservations,
      count: formattedReservations.length,
      message: 'Reservas encontradas com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro no GET reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500)
  }
}

// POST - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase não configurado:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      })
      return createJsonResponse({
        error: 'Configuração do servidor incompleta',
        details: 'Supabase não está configurado corretamente'
      }, 500)
    }

    // Parse do body dentro do try-catch conforme recomendação
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError)
      return createJsonResponse({
        error: 'JSON inválido no corpo da requisição',
        details: parseError instanceof Error ? parseError.message : 'Erro de parse'
      }, 400)
    }

    const { user_id, nome, email, telefone, data, horario, pessoas, observacoes } = body

    // Validação básica
    if (!user_id || !nome || !email || !telefone || !data || !horario || !pessoas) {
      return createJsonResponse({
        error: 'Campos obrigatórios: user_id, nome, email, telefone, data, horario, pessoas',
        received: { user_id, nome, email, telefone, data, horario, pessoas }
      }, 400)
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createJsonResponse({
        error: 'Email inválido',
        received: email
      }, 400)
    }

    // Validar número de pessoas
    if (pessoas < 1 || pessoas > 20) {
      return createJsonResponse({
        error: 'Número de pessoas deve ser entre 1 e 20',
        received: pessoas
      }, 400)
    }

    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(data)) {
      return createJsonResponse({
        error: 'Data deve estar no formato YYYY-MM-DD',
        received: data
      }, 400)
    }

    // Validar formato do horário
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(horario)) {
      return createJsonResponse({
        error: 'Horário deve estar no formato HH:MM',
        received: horario
      }, 400)
    }

    // Verificar se a data não é no passado
    const requestDate = new Date(data + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (requestDate < today) {
      return createJsonResponse({
        error: 'Não é possível fazer reservas para datas passadas',
        received: data
      }, 400)
    }

    // Gerar token de confirmação único
    const confirmationToken = crypto.randomBytes(32).toString('hex')

    // Criar cliente Supabase com service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Log para debugging
    console.log('🔍 Tentando criar reserva:', { 
      user_id, nome, email, data, horario, pessoas 
    })

    // Inserir reserva no banco de dados
    const { data: newReservation, error } = await supabase
      .from('reservations')
      .insert({
        user_id,
        nome,
        email,
        telefone,
        data,
        horario,
        pessoas,
        observacoes: observacoes || null,
        status: 'pendente',
        confirmation_token: confirmationToken
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar reserva:', error)
      return createJsonResponse({
        error: 'Erro ao criar reserva',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, 500)
    }

    console.log('✅ Reserva criada com sucesso:', newReservation.id)

    // Enviar email de confirmação para o usuário
    try {
      const emailResult = await emailService.sendReservationConfirmation({
        id: newReservation.id,
        nome,
        email,
        telefone,
        data,
        horario,
        pessoas,
        observacoes,
        confirmationToken: confirmationToken
      })

      console.log('✅ Email enviado:', emailResult.success)
    } catch (emailError) {
      console.warn('⚠️  Erro ao enviar email:', emailError)
      // Não falhamos a operação por causa do email
    }

    // Retornar reserva criada
    return createJsonResponse({
      success: true,
      data: {
        id: newReservation.id,
        user_id: newReservation.user_id,
        nome: newReservation.nome,
        email: newReservation.email,
        telefone: newReservation.telefone,
        data: newReservation.data,
        horario: newReservation.horario,
        pessoas: newReservation.pessoas,
        status: newReservation.status,
        observacoes: newReservation.observacoes,
        created_at: newReservation.created_at
      },
      message: 'Reserva criada com sucesso'
    }, 201)

  } catch (error) {
    console.error('❌ Erro no POST reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500)
  }
}

// PUT - Atualizar status da reserva
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, confirmation_token } = body

    if (!id || !status) {
      return createJsonResponse({
        error: 'Campos obrigatórios: id, status'
      }, 400)
    }

    // Validar status
    const validStatuses = ['pendente', 'confirmada', 'cancelada']
    if (!validStatuses.includes(status)) {
      return createJsonResponse({
        error: 'Status inválido. Use: ' + validStatuses.join(', ')
      }, 400)
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Construir condições de atualização
    let query = supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)

    // Se for confirmação por token, validar token
    if (status === 'confirmada' && confirmation_token) {
      query = query.eq('confirmation_token', confirmation_token)
    }

    const { data: updatedReservation, error } = await query
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar reserva:', error)
      return createJsonResponse({
        error: 'Erro ao atualizar reserva ou token inválido',
        details: error.message
      }, 500)
    }

    // Se foi confirmada, enviar notificação para admin
    if (status === 'confirmada') {
      try {
        await emailService.sendAdminNotification({
          id: updatedReservation.id,
          nome: updatedReservation.nome,
          email: updatedReservation.email,
          telefone: updatedReservation.telefone,
          data: updatedReservation.data,
          horario: updatedReservation.horario,
          pessoas: updatedReservation.pessoas,
          observacoes: updatedReservation.observacoes,
          confirmationToken: updatedReservation.confirmation_token
        })
      } catch (emailError) {
        console.error('Erro ao enviar notificação para admin:', emailError)
        // Não falhar a confirmação por causa do email
      }
    }

    return createJsonResponse({
      success: true,
      data: updatedReservation,
      message: `Reserva ${status} com sucesso`
    })

  } catch (error) {
    console.error('Erro no PUT reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
}

// DELETE - Deletar reserva
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!id) {
      return createJsonResponse({
        error: 'ID da reserva é obrigatório'
      }, 400)
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Construir query de delete
    let query = supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    // Se user_id fornecido, garantir que usuário só delete suas próprias reservas
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) {
      console.error('Erro ao deletar reserva:', error)
      return createJsonResponse({
        error: 'Erro ao deletar reserva ou reserva não encontrada',
        details: error.message
      }, 500)
    }

    return createJsonResponse({
      success: true,
      message: 'Reserva deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro no DELETE reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
} 