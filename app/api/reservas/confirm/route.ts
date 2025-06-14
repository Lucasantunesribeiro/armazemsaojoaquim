import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService } from '../../../../lib/email-service'
import { ENV } from '../../../../lib/config'

// Configuração do Supabase
const supabaseUrl = ENV.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuração do Supabase está incompleta')
  throw new Error('Configuração do Supabase está incompleta')
}

// Função para criar resposta JSON com headers CORS obrigatórios
function createJsonResponse(data: any, status: number = 200) {
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

// GET - Confirmar reserva via token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return createJsonResponse({
        error: 'Token de confirmação é obrigatório',
        usage: 'GET /api/reservas/confirm?token=TOKEN'
      }, 400)
    }

    // Criar cliente Supabase com service role key
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    console.log('🔍 Buscando reserva com token:', token)

    // Buscar reserva pelo token de confirmação
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('confirmation_token', token)
      .single()

    if (fetchError || !reservation) {
      console.error('❌ Erro ao buscar reserva:', fetchError)
      return createJsonResponse({
        error: 'Token de confirmação inválido ou expirado',
        message: 'Por favor, solicite uma nova reserva ou entre em contato conosco.',
        details: fetchError?.message
      }, 404)
    }

    console.log('✅ Reserva encontrada:', reservation.id)

    // Verificar se a reserva já foi confirmada
    if (reservation.status === 'confirmada') {
      console.log('ℹ️ Reserva já estava confirmada')
      
      const successHtml = generateSuccessPage(reservation, true)
      return new NextResponse(successHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    // Atualizar status para confirmada
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update({ 
        status: 'confirmada',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservation.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao confirmar reserva:', updateError)
      return createJsonResponse({
        error: 'Erro ao confirmar reserva',
        details: updateError.message
      }, 500)
    }

    console.log('✅ Reserva confirmada com sucesso:', updatedReservation.id)

    // Enviar notificação para o admin
    try {
      console.log('📧 Enviando notificação para o restaurante...')
      
      const adminEmailResult = await emailService.sendAdminNotification({
        id: updatedReservation.id,
        nome: updatedReservation.nome,
        email: updatedReservation.email,
        telefone: updatedReservation.telefone,
        data: updatedReservation.data,
        horario: updatedReservation.horario,
        pessoas: updatedReservation.pessoas,
        observacoes: updatedReservation.observacoes,
        confirmationToken: token
      })

      if (adminEmailResult.success) {
        console.log('✅ Notificação enviada para o restaurante!')
      } else {
        console.warn('⚠️ Falha ao enviar notificação para admin:', adminEmailResult.error)
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar notificação para admin:', emailError)
    }

    // Retornar página de sucesso (HTML)
    const successHtml = generateSuccessPage(updatedReservation, false)
    return new NextResponse(successHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('❌ Erro no GET confirm:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500)
  }
}

// Função para gerar página de sucesso
function generateSuccessPage(reservation: any, alreadyConfirmed: boolean = false) {
  const message = alreadyConfirmed 
    ? 'Esta reserva já foi confirmada anteriormente.' 
    : 'Sua reserva foi confirmada e nossa equipe foi notificada.';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Confirmada - Armazém São Joaquim</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                color: #8B4513;
                margin-bottom: 30px;
            }
            .success-icon {
                font-size: 48px;
                color: #28a745;
                margin-bottom: 20px;
            }
            .details {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 5px;
                padding: 20px;
                margin: 20px 0;
            }
            .btn {
                display: inline-block;
                background: #8B4513;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 5px;
            }
            .btn:hover {
                background: #6d3410;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Armazém São Joaquim</h1>
                <p>"En esta casa tenemos memoria"</p>
            </div>
            
            <div style="text-align: center;">
                <div class="success-icon">✅</div>
                <h2 style="color: #28a745;">Reserva Confirmada com Sucesso!</h2>
                <p>Olá, <strong>${reservation.nome}</strong>!</p>
                <p>${message}</p>
            </div>

            <div class="details">
                <h3>Detalhes da sua Reserva:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>📅 Data:</strong> ${new Date(reservation.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                    <li><strong>🕐 Horário:</strong> ${reservation.horario}</li>
                    <li><strong>👥 Pessoas:</strong> ${reservation.pessoas} ${reservation.pessoas === 1 ? 'pessoa' : 'pessoas'}</li>
                    <li><strong>🆔 Código:</strong> ${reservation.id}</li>
                    ${reservation.observacoes ? `<li><strong>📝 Observações:</strong> ${reservation.observacoes}</li>` : ''}
                </ul>
            </div>

            <div style="text-align: center;">
                <p><strong>O que acontece agora?</strong></p>
                <p>Nossa equipe irá preparar tudo para recebê-lo(a). Se precisar de alguma alteração, entre em contato conosco.</p>
                
                <a href="${ENV.SITE_URL}" class="btn">🏠 Voltar ao Site</a>
                <a href="https://wa.me/5521985658443" class="btn">💬 WhatsApp</a>
            </div>

            <div class="footer">
                <p><strong>Armazém São Joaquim</strong><br/>
                Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ<br/>
                📞 (21) 98565-8443 | 📧 armazemsaojoaquimoficial@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    `
} 