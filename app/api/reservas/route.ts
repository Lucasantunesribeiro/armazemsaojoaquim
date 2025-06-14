import { NextRequest, NextResponse } from 'next/server'

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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Se não há user_id, retorna lista vazia ou todas as reservas (para teste)
    if (!userId) {
      return createJsonResponse({
        success: true,
        data: [],
        count: 0,
        message: 'Nenhuma reserva encontrada (user_id não fornecido)',
        usage: 'Para buscar reservas específicas: GET /api/reservas?user_id=USER_ID'
      }, 200)
    }

    // Simular busca de reservas do usuário
    // Em produção, aqui você consultaria o banco de dados
    const mockReservations = [
      {
        id: '1',
        user_id: userId,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(21) 99999-9999',
        data: '2024-12-25',
        horario: '19:00',
        pessoas: 4,
        status: 'confirmada',
        observacoes: 'Mesa próxima à janela',
        created_at: '2024-12-20T10:00:00Z'
      },
      {
        id: '2',
        user_id: userId,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(21) 99999-9999',
        data: '2024-12-30',
        horario: '20:30',
        pessoas: 2,
        status: 'pendente',
        observacoes: null,
        created_at: '2024-12-20T15:30:00Z'
      }
    ]

    return createJsonResponse({
      success: true,
      data: mockReservations,
      count: mockReservations.length,
      message: 'Reservas encontradas com sucesso'
    })

  } catch (error) {
    console.error('Erro no GET reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
}

// POST - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    // Simular criação da reserva
    // Em produção, aqui você salvaria no banco de dados
    const newReservation = {
      id: Math.random().toString(36).substr(2, 9),
      user_id,
      nome,
      email,
      telefone,
      data,
      horario,
      pessoas,
      observacoes: observacoes || null,
      status: 'pendente',
      created_at: new Date().toISOString()
    }

    return createJsonResponse({
      success: true,
      data: newReservation,
      message: 'Reserva criada com sucesso'
    }, 201)

  } catch (error) {
    console.error('Erro no POST reservas:', error)
    
    // Se o erro for de parsing JSON
    if (error instanceof SyntaxError) {
      return createJsonResponse({
        error: 'JSON inválido no corpo da requisição',
        details: error.message
      }, 400)
    }

    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
}

// PUT - Atualizar reserva
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, ...updateData } = body

    if (!id) {
      return createJsonResponse({
        error: 'ID da reserva é obrigatório',
        usage: 'PUT /api/reservas com { id: "RESERVATION_ID", ... }'
      }, 400)
    }

    // Simular atualização da reserva
    const updatedReservation = {
      id,
      ...updateData,
      status: status || 'pendente',
      updated_at: new Date().toISOString()
    }

    return createJsonResponse({
      success: true,
      data: updatedReservation,
      message: 'Reserva atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro no PUT reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
}

// DELETE - Cancelar reserva
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createJsonResponse({
        error: 'ID da reserva é obrigatório',
        usage: 'DELETE /api/reservas?id=RESERVATION_ID'
      }, 400)
    }

    // Simular cancelamento da reserva
    return createJsonResponse({
      success: true,
      message: 'Reserva cancelada com sucesso',
      id
    })

  } catch (error) {
    console.error('Erro no DELETE reservas:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
} 