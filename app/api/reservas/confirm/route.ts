import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // Atualizar status para confirmada e definir data de confirmação
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update({ 
        status: 'confirmada',
        confirmado_em: new Date().toISOString(),
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

    // Retornar página de sucesso (HTML) com dados para envio de notificação
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
                margin-top: 20px;
            }
            .btn:hover {
                background: #6d3410;
            }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">✅</div>
                <h1>Reserva Confirmada!</h1>
                <p>${message}</p>
            </div>

            <div class="details">
                <h3>Detalhes da sua reserva:</h3>
                <p><strong>Nome:</strong> ${reservation.nome}</p>
                <p><strong>Data:</strong> ${new Date(reservation.data).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Horário:</strong> ${reservation.horario}</p>
                <p><strong>Pessoas:</strong> ${reservation.pessoas}</p>
                <p><strong>Email:</strong> ${reservation.email}</p>
                <p><strong>Telefone:</strong> ${reservation.telefone}</p>
                ${reservation.observacoes ? `<p><strong>Observações:</strong> ${reservation.observacoes}</p>` : ''}
            </div>

            <div style="text-align: center;">
                <a href="${baseUrl}" class="btn">Voltar ao site</a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 5px;">
                <h4 style="color: #1976d2; margin-top: 0;">Importante:</h4>
                <p style="margin-bottom: 0;">• Chegue com 10 minutos de antecedência</p>
                <p style="margin-bottom: 0;">• Confirme sua presença por WhatsApp: (21) 98565-8443</p>
                <p style="margin-bottom: 0;">• Em caso de cancelamento, avise com até 2 horas de antecedência</p>
            </div>
        </div>
        
        ${!alreadyConfirmed ? `
        <script>
            // Enviar notificação para o restaurante via EmailJS
            (function() {
                emailjs.init('g-gdzBLucmE8eoUlq');
                
                const templateParams = {
                    to_email: 'armazemsaojoaquimoficial@gmail.com',
                    reservation_id: '${reservation.id}',
                    customer_name: '${reservation.nome}',
                    customer_email: '${reservation.email}',
                    customer_phone: '${reservation.telefone}',
                    reservation_date: '${new Date(reservation.data).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}',
                    reservation_time: '${reservation.horario}',
                    guest_count: '${reservation.pessoas}',
                    special_requests: '${reservation.observacoes || 'Nenhuma observação especial'}',
                    created_at: '${new Date().toLocaleString('pt-BR')}',
                    restaurant_name: 'Armazém São Joaquim'
                };
                
                emailjs.send('service_gxo49v9', 'template_pnnqpyf', templateParams)
                    .then(function(response) {
                        console.log('✅ Notificação enviada para o restaurante:', response.status, response.text);
                    })
                    .catch(function(error) {
                        console.error('❌ Erro ao enviar notificação para o restaurante:', error);
                    });
            })();
        </script>
        ` : ''}
    </body>
    </html>
    `
} 
