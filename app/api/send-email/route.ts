import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailRequest {
  type: 'reservation_confirmation' | 'reservation_reminder'
  to: string
  reservationData: {
    id: string
    name: string
    date: string
    time: string
    guests: number
    confirmationCode?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { type, to, reservationData } = body

    // Validar dados obrigatórios
    if (!to || !reservationData) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    let emailContent;
    let subject;

    switch (type) {
      case 'reservation_confirmation':
        subject = `Confirmação de Reserva - Armazém São Joaquim`
        emailContent = generateConfirmationEmail(reservationData)
        break
      case 'reservation_reminder':
        subject = `Lembrete: Sua reserva é amanhã - Armazém São Joaquim`
        emailContent = generateReminderEmail(reservationData)
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de email inválido' },
          { status: 400 }
        )
    }

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Armazém São Joaquim <reservas@armazemsaojoaquim.com>',
      to: [to],
      subject,
      html: emailContent,
      headers: {
        'X-Entity-Ref-ID': reservationData.id,
      },
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return NextResponse.json(
        { error: 'Erro ao enviar email', details: error },
        { status: 500 }
      )
    }

    // Log enviado com sucesso
    console.log('Email enviado:', {
      type,
      recipient: to,
      emailId: data?.id,
      reservationId: reservationData.id
    })

    return NextResponse.json({ 
      success: true, 
      emailId: data?.id,
      message: 'Email enviado com sucesso' 
    })

  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateConfirmationEmail(reservationData: any): string {
  const { name, date, time, guests, confirmationCode } = reservationData
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Reserva</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F4D03F, #C0392B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .reservation-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { background: #3E2723; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .confirmation-code { background: #F4D03F; color: #3E2723; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ Armazém São Joaquim</h1>
          <p style="color: white; margin: 10px 0 0 0;">"En esta casa tenemos memoria"</p>
        </div>
        
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Sua reserva foi recebida com sucesso! Estamos ansiosos para recebê-lo(a) em nosso restaurante histórico.</p>
          
          <div class="reservation-details">
            <h3>📋 Detalhes da sua Reserva</h3>
            <div class="detail-row">
              <strong>Data:</strong>
              <span>${new Date(date).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <strong>Horário:</strong>
              <span>${time}</span>
            </div>
            <div class="detail-row">
              <strong>Pessoas:</strong>
              <span>${guests} ${guests === 1 ? 'pessoa' : 'pessoas'}</span>
            </div>
          </div>

          ${confirmationCode ? `
            <div class="confirmation-code">
              <strong>Código de Confirmação: ${confirmationCode}</strong>
            </div>
            <p><strong>Importante:</strong> Apresente este código no dia da sua reserva.</p>
          ` : ''}

          <h3>📍 Como Chegar</h3>
          <p>
            <strong>Endereço:</strong> Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ<br>
            <strong>Telefone:</strong> +55 21 98565-8443
          </p>

          <h3>⏰ Informações Importantes</h3>
          <ul>
            <li>Chegue com 15 minutos de antecedência</li>
            <li>Em caso de atraso superior a 15 minutos, a mesa poderá ser liberada</li>
            <li>Para cancelamentos, entre em contato até 24 horas antes</li>
            <li>Aceitamos cartão de crédito e débito</li>
          </ul>

          <p>Se precisar de qualquer alteração ou tiver dúvidas, entre em contato conosco pelo WhatsApp <strong>+55 21 98565-8443</strong>.</p>
        </div>

        <div class="footer">
          <p><strong>Armazém São Joaquim</strong></p>
          <p>170 anos preservando a história de Santa Teresa</p>
          <p>📧 armazemjoaquimoficial@gmail.com | 📞 +55 21 98565-8443</p>
          <p>Instagram: @armazemsaojoaquim</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateReminderEmail(reservationData: any): string {
  const { name, date, time, guests } = reservationData
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lembrete de Reserva</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F4D03F, #C0392B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #3E2723; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ Armazém São Joaquim</h1>
          <p style="color: white; margin: 10px 0 0 0;">Lembrete da sua reserva</p>
        </div>
        
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Este é um lembrete de que sua reserva é <strong>amanhã</strong>!</p>
          
          <div class="reminder-box">
            <h3>⏰ Sua Reserva:</h3>
            <p><strong>Data:</strong> ${new Date(date).toLocaleDateString('pt-BR')}<br>
            <strong>Horário:</strong> ${time}<br>
            <strong>Pessoas:</strong> ${guests}</p>
          </div>

          <p>Estamos ansiosos para recebê-lo(a) em nosso restaurante histórico!</p>
          
          <p>📍 <strong>Endereço:</strong> Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro</p>
          
          <p>Se precisar fazer alguma alteração, entre em contato conosco pelo WhatsApp <strong>+55 21 98565-8443</strong>.</p>
        </div>

        <div class="footer">
          <p><strong>Armazém São Joaquim</strong></p>
          <p>📧 armazemjoaquimoficial@gmail.com | 📞 +55 21 98565-8443</p>
        </div>
      </div>
    </body>
    </html>
  `
} 