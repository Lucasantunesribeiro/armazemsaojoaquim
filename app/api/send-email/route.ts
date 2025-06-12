import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'

// Verificar se a API key está configurada
const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function GET() {
  return NextResponse.json({
    service: 'Email Service',
    status: resend ? 'configured' : 'not_configured',
    message: resend 
      ? 'Serviço de email está funcionando corretamente' 
      : 'API key do Resend não configurada. Configure RESEND_API_KEY nas variáveis de ambiente.',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  if (!resend) {
    return NextResponse.json({
      error: 'Serviço de email não configurado',
      message: 'API key do Resend não encontrada'
    }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({
        error: 'Tipo e dados são obrigatórios'
      }, { status: 400 })
    }

    let emailResult

    switch (type) {
      case 'reservation_confirmation':
        emailResult = await sendReservationConfirmation(data)
        break
      case 'reservation_confirmed':
        emailResult = await sendReservationConfirmedNotification(data.reservationData)
        break
      case 'reservation_reminder':
        emailResult = await sendReservationReminder(data)
        break
      case 'contact_form':
        emailResult = await sendContactForm(data)
        break
      default:
        return NextResponse.json({
          error: 'Tipo de email não suportado'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      data: emailResult
    })

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({
      error: 'Erro ao enviar email',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

async function sendReservationConfirmation(data: any) {
  if (!resend) {
    throw new Error('Resend não configurado')
  }

  const { email, name, date, time, guests, reservationId, confirmationCode, phone, requests } = data
  
  const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://armazemsaojoaquim.netlify.app'}/api/confirm-reservation?token=${confirmationCode}`
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return await resend.emails.send({
    from: 'Armazém São Joaquim <noreply@armazemsaojoaquim.netlify.app>',
    to: email,
    subject: `Confirme sua reserva - ${formattedDate} às ${time}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme sua Reserva</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #2C2C2C;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #D4AF37 0%, #C65D07 100%);
              padding: 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-family: 'Playfair Display', serif;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .reservation-card {
              background: #f8f9fa;
              border: 2px solid #E6D7C3;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
            }
            .reservation-details {
              display: grid;
              gap: 12px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #dee2e6;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #8B4513;
            }
            .detail-value {
              color: #2C2C2C;
            }
            .confirm-button {
              display: block;
              width: 100%;
              max-width: 300px;
              margin: 30px auto;
              padding: 15px 25px;
              background: #D4AF37;
              color: #2C2C2C;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 16px;
              text-align: center;
              transition: background-color 0.3s;
            }
            .confirm-button:hover {
              background: #C19B26;
            }
            .warning-box {
              background: #FFF3CD;
              border: 1px solid #FFEAA7;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
            }
            .warning-text {
              color: #856404;
              font-weight: 600;
              margin: 0;
            }
            .footer {
              background: #2C2C2C;
              color: white;
              padding: 30px;
              text-align: center;
              font-size: 14px;
            }
            .contact-info {
              margin: 20px 0;
              line-height: 1.8;
            }
            .social-links {
              margin-top: 20px;
            }
            .social-links a {
              color: #D4AF37;
              text-decoration: none;
              margin: 0 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ Armazém São Joaquim</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                "En esta casa tenemos memoria"
              </p>
            </div>
            
            <div class="content">
              <h2 style="color: #8B4513; margin-bottom: 20px;">Olá, ${name}!</h2>
              
              <p>Recebemos sua solicitação de reserva para o Armazém São Joaquim. Para confirmar sua reserva, clique no botão abaixo:</p>
              
              <div class="reservation-card">
                <h3 style="color: #8B4513; margin-top: 0;">📅 Detalhes da sua Reserva</h3>
                <div class="reservation-details">
                  <div class="detail-row">
                    <span class="detail-label">📅 Data:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🕒 Horário:</span>
                    <span class="detail-value">${time}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">👥 Pessoas:</span>
                    <span class="detail-value">${guests}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">📧 Email:</span>
                    <span class="detail-value">${email}</span>
                  </div>
                  ${phone ? `
                    <div class="detail-row">
                      <span class="detail-label">📱 Telefone:</span>
                      <span class="detail-value">${phone}</span>
                    </div>
                  ` : ''}
                  ${requests ? `
                    <div class="detail-row">
                      <span class="detail-label">📝 Observações:</span>
                      <span class="detail-value">${requests}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
              
              <a href="${confirmationUrl}" class="confirm-button">
                ✅ CONFIRMAR RESERVA
              </a>
              
              <div class="warning-box">
                <p class="warning-text">
                  ⚠️ ATENÇÃO: Você tem até 24 horas para confirmar sua reserva.<br>
                  Após este prazo, a reserva será automaticamente cancelada.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>Não consegue clicar no botão?</strong> Copie e cole este link no seu navegador:<br>
                <a href="${confirmationUrl}" style="color: #D4AF37; word-break: break-all;">
                  ${confirmationUrl}
                </a>
              </p>
            </div>
            
            <div class="footer">
              <div class="contact-info">
                <strong>Armazém São Joaquim</strong><br>
                📍 Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ<br>
                📞 +55 21 98565-8443<br>
                📧 armazemsaojoaquimoficial@gmail.com
              </div>
              
              <div class="social-links">
                <a href="https://www.instagram.com/armazemsaojoaquim/">📷 Instagram</a>
                <a href="https://vivapp.bukly.com/d/hotel_view/5041">🏨 Pousada</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 12px; opacity: 0.8;">
                © 2024 Armazém São Joaquim - 170 anos preservando a história de Santa Teresa
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}

async function sendReservationReminder(data: any) {
  if (!resend) {
    throw new Error('Resend não configurado')
  }

  const { email, name, date, time, guests } = data
  
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return await resend.emails.send({
    from: 'Armazém São Joaquim <noreply@armazemsaojoaquim.netlify.app>',
    to: email,
    subject: `Lembrete: Sua reserva é amanhã - ${formattedDate} às ${time}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lembrete de Reserva</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #2C2C2C;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%);
              padding: 30px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .reminder-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ Armazém São Joaquim</h1>
            </div>
            
            <div class="content">
              <div class="reminder-icon">⏰</div>
              <h2 style="color: #8B4513;">Lembrete da sua Reserva</h2>
              
              <p>Olá, ${name}!</p>
              <p>Não esqueça: sua reserva é <strong>amanhã</strong>!</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📅 ${formattedDate}</h3>
                <h3>🕒 ${time}</h3>
                <h3>👥 ${guests} pessoa(s)</h3>
              </div>
              
              <p>Aguardamos você no Armazém São Joaquim!</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                📍 Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ<br>
                📞 +55 21 98565-8443
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}

async function sendContactForm(data: any) {
  if (!resend) {
    throw new Error('Resend não configurado')
  }

  const { name, email, phone, subject, message } = data

  return await resend.emails.send({
    from: 'Armazém São Joaquim <noreply@armazemsaojoaquim.netlify.app>',
    to: 'armazemsaojoaquimoficial@gmail.com',
    subject: `Novo contato pelo site: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Novo Contato - Site</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #8B4513;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #ddd;
            }
            .label {
              font-weight: bold;
              color: #8B4513;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>📧 Novo Contato pelo Site</h2>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">Nome:</div>
              <div>${name}</div>
            </div>
            
            <div class="field">
              <div class="label">E-mail:</div>
              <div>${email}</div>
            </div>
            
            ${phone ? `
              <div class="field">
                <div class="label">Telefone:</div>
                <div>${phone}</div>
              </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Assunto:</div>
              <div>${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Mensagem:</div>
              <div>${message}</div>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Mensagem enviada em: ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </body>
      </html>
    `
  })
}

async function sendReservationConfirmedNotification(reservationData: any) {
  if (!resend) {
    throw new Error('Resend não configurado')
  }

  const { id, data, horario, pessoas, observacoes, telefone_confirmacao, nome } = reservationData
  
  const formattedDate = new Date(data).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return await resend.emails.send({
    from: 'Sistema de Reservas <noreply@armazemsaojoaquim.netlify.app>',
    to: 'armazemsaojoaquimoficial@gmail.com',
    subject: `🔔 Nova Reserva Confirmada - ${formattedDate} às ${horario}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Nova Reserva Confirmada</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #28a745, #20c997);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px;
            }
            .reservation-card {
              background: #f8f9fa;
              border: 2px solid #28a745;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .detail-grid {
              display: grid;
              gap: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #dee2e6;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #28a745;
            }
            .detail-value {
              color: #333;
            }
            .status-badge {
              background: #28a745;
              color: white;
              padding: 8px 15px;
              border-radius: 20px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              background: #2C2C2C;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Nova Reserva Confirmada!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">
                Armazém São Joaquim
              </p>
            </div>
            
            <div class="content">
              <div class="status-badge">
                ✅ CONFIRMADA
              </div>
              
              <p>Uma nova reserva foi confirmada pelo cliente:</p>
              
              <div class="reservation-card">
                <h3 style="color: #28a745; margin-top: 0;">📋 Detalhes da Reserva</h3>
                <div class="detail-grid">
                  <div class="detail-row">
                    <span class="detail-label">👤 Nome:</span>
                    <span class="detail-value">${nome}</span>
                  </div>
                  ${telefone_confirmacao ? `
                    <div class="detail-row">
                      <span class="detail-label">📱 Telefone:</span>
                      <span class="detail-value">${telefone_confirmacao}</span>
                    </div>
                  ` : ''}
                  <div class="detail-row">
                    <span class="detail-label">📅 Data:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🕒 Horário:</span>
                    <span class="detail-value">${horario}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">👥 Pessoas:</span>
                    <span class="detail-value">${pessoas}</span>
                  </div>
                  ${observacoes ? `
                    <div class="detail-row">
                      <span class="detail-label">📝 Observações:</span>
                      <span class="detail-value">${observacoes}</span>
                    </div>
                  ` : ''}
                  <div class="detail-row">
                    <span class="detail-label">🆔 ID da Reserva:</span>
                    <span class="detail-value">${id}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">⏰ Confirmada em:</span>
                    <span class="detail-value">${new Date().toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              
              <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #1976d2; margin-top: 0;">💡 Próximos Passos:</h4>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Preparar mesa para ${pessoas} pessoa(s)</li>
                  <li>Verificar disponibilidade da mesa</li>
                  <li>Confirmar cardápio especial se houver observações</li>
                  ${telefone_confirmacao ? `<li>Contato direto: ${telefone_confirmacao}</li>` : ''}
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Sistema de Reservas - Armazém São Joaquim</strong></p>
              <p>📧 Recebido em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
} 