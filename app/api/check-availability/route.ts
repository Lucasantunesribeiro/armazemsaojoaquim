import { NextRequest, NextResponse } from 'next/server'

// Função para criar resposta JSON com headers CORS
function createJsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// GET - Health check
export async function GET() {
  try {
    return createJsonResponse({
      status: 'healthy',
      message: 'API de verificação de disponibilidade funcionando',
      timestamp: new Date().toISOString(),
      endpoint: '/api/check-availability'
    })
  } catch (error) {
    console.error('Erro no GET check-availability:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }, 500)
  }
}

// POST - Check availability
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { date, time, guests } = body

    // Validação básica
    if (!date || !time || !guests) {
      return createJsonResponse({
        error: 'Parâmetros obrigatórios: date, time, guests',
        received: { date, time, guests }
      }, 400)
    }

    // Validar número de pessoas
    if (guests < 1 || guests > 20) {
      return createJsonResponse({
        error: 'Número de pessoas deve ser entre 1 e 20',
        received: guests
      }, 400)
    }

    // Validar formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return createJsonResponse({
        error: 'Data deve estar no formato YYYY-MM-DD',
        received: date
      }, 400)
    }

    // Validar formato do horário (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(time)) {
      return createJsonResponse({
        error: 'Horário deve estar no formato HH:MM',
        received: time
      }, 400)
    }

    // Verificar se a data não é no passado
    const requestDate = new Date(date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (requestDate < today) {
      return createJsonResponse({
        error: 'Não é possível fazer reservas para datas passadas',
        received: date
      }, 400)
    }

    // Simular verificação de disponibilidade
    // Em produção, aqui você consultaria o banco de dados
    const isAvailable = Math.random() > 0.3 // 70% de chance de estar disponível

    if (isAvailable) {
      return createJsonResponse({
        available: true,
        message: 'Horário disponível para reserva',
        details: {
          date,
          time,
          guests,
          maxCapacity: 50,
          remainingSlots: Math.floor(Math.random() * 10) + 1
        }
      })
    } else {
      return createJsonResponse({
        available: false,
        message: 'Horário não disponível',
        details: {
          date,
          time,
          guests,
          reason: 'Capacidade máxima atingida para este horário'
        },
        suggestions: [
          { time: '18:00', available: true },
          { time: '20:30', available: true }
        ]
      })
    }

  } catch (error) {
    console.error('Erro no POST check-availability:', error)
    
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
