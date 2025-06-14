import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '../../../../lib/email-service'

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

// Simulação de banco de dados em memória para demonstração
// Em produção, isso seria substituído por consultas reais ao banco
const reservationsDB = new Map<string, any>()

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

    // Em produção, você buscaria a reserva no banco de dados pelo token
    // Por enquanto, vamos simular uma reserva encontrada
    const mockReservation = {
      id: 'res_' + Math.random().toString(36).substr(2, 9),
      nome: 'Cliente Exemplo',
      email: 'cliente@email.com',
      telefone: '(21) 99999-9999',
      data: '2024-12-25',
      horario: '19:00',
      pessoas: 4,
      observacoes: 'Mesa próxima à janela',
      status: 'pendente',
      confirmation_token: token,
      created_at: new Date().toISOString()
    }

    // Verificar se o token é válido (em produção, consultar banco)
    if (!mockReservation || mockReservation.confirmation_token !== token) {
      return createJsonResponse({
        error: 'Token de confirmação inválido ou expirado',
        message: 'Por favor, solicite uma nova reserva ou entre em contato conosco.'
      }, 404)
    }

    // Verificar se a reserva já foi confirmada
    if (mockReservation.status === 'confirmada') {
      return createJsonResponse({
        success: true,
        message: 'Esta reserva já foi confirmada anteriormente.',
        data: {
          ...mockReservation,
          status: 'confirmada'
        }
      })
    }

    // Atualizar status para confirmada
    const confirmedReservation = {
      ...mockReservation,
      status: 'confirmada',
      confirmed_at: new Date().toISOString()
    }

    // Salvar no "banco" (em produção, UPDATE no banco real)
    reservationsDB.set(confirmedReservation.id, confirmedReservation)

    // Enviar notificação para o admin
    try {
      const adminEmailResult = await emailService.sendAdminNotification({
        id: confirmedReservation.id,
        nome: confirmedReservation.nome,
        email: confirmedReservation.email,
        telefone: confirmedReservation.telefone,
        data: confirmedReservation.data,
        horario: confirmedReservation.horario,
        pessoas: confirmedReservation.pessoas,
        observacoes: confirmedReservation.observacoes,
        confirmationToken: token
      })

      if (!adminEmailResult.success) {
        console.warn('Falha ao enviar notificação para admin:', adminEmailResult.error)
      }
    } catch (emailError) {
      console.error('Erro ao enviar notificação para admin:', emailError)
    }

    // Retornar página de sucesso (HTML)
    const successHtml = `
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
                <p>Olá, <strong>${confirmedReservation.nome}</strong>!</p>
                <p>Sua reserva foi confirmada e nossa equipe foi notificada.</p>
            </div>

            <div class="details">
                <h3>Detalhes da sua Reserva:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>📅 Data:</strong> ${new Date(confirmedReservation.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                    <li><strong>🕐 Horário:</strong> ${confirmedReservation.horario}</li>
                    <li><strong>👥 Pessoas:</strong> ${confirmedReservation.pessoas} ${confirmedReservation.pessoas === 1 ? 'pessoa' : 'pessoas'}</li>
                    <li><strong>🆔 Código:</strong> ${confirmedReservation.id}</li>
                    ${confirmedReservation.observacoes ? `<li><strong>📝 Observações:</strong> ${confirmedReservation.observacoes}</li>` : ''}
                </ul>
            </div>

            <div style="text-align: center;">
                <p><strong>O que acontece agora?</strong></p>
                <p>Nossa equipe irá preparar tudo para recebê-lo(a). Se precisar de alguma alteração, entre em contato conosco.</p>
                
                <a href="https://armazemsaojoaquim.netlify.app" class="btn">🏠 Voltar ao Site</a>
                <a href="https://wa.me/5521985658443" class="btn">💬 WhatsApp</a>
            </div>

            <div class="footer">
                <p><strong>Armazém São Joaquim</strong><br>
                Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ<br>
                📞 (21) 98565-8443 | 📧 armazemsaojoaquimoficial@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    `

    return new NextResponse(successHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })

  } catch (error) {
    console.error('Erro na confirmação de reserva:', error)
    
    const errorHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro na Confirmação - Armazém São Joaquim</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .error-icon { font-size: 48px; color: #dc3545; margin-bottom: 20px; }
            .btn { display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">❌</div>
            <h2 style="color: #dc3545;">Erro na Confirmação</h2>
            <p>Ocorreu um erro ao processar sua confirmação de reserva.</p>
            <p>Por favor, entre em contato conosco para resolver esta situação.</p>
            <a href="https://armazemsaojoaquim.netlify.app" class="btn">🏠 Voltar ao Site</a>
            <a href="https://wa.me/5521985658443" class="btn">💬 Contato</a>
        </div>
    </body>
    </html>
    `

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  }
} 