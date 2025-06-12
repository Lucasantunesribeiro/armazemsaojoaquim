import { NextRequest, NextResponse } from 'next/server'

interface EmailRequest {
  to?: string
  subject: string
  message: string
  name?: string
  email?: string
  phone?: string
  // Para reservas
  date?: string
  time?: string
  people?: number
  type?: 'contact' | 'reservation'
}

export async function POST(request: NextRequest) {
  try {
    const data: EmailRequest = await request.json()

    // Validar dados básicos
    if (!data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Por enquanto, vamos simular o envio de email
    // Em produção, você configuraria um provedor como SendGrid, Nodemailer, etc.
    
    console.log('Email request received:', {
      type: data.type || 'contact',
      to: data.to || 'contato@armazemsaojoaquim.com',
      subject: data.subject,
      from: data.email,
      name: data.name,
      phone: data.phone,
      message: data.message,
      // Dados específicos de reserva
      date: data.date,
      time: data.time,
      people: data.people,
      timestamp: new Date().toISOString()
    })

    // Aqui você integraria com seu provedor de email
    // Exemplo com SendGrid:
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to: data.to || 'contato@armazemsaojoaquim.com',
      from: 'noreply@armazemsaojoaquim.com',
      subject: data.subject,
      text: data.message,
      html: generateEmailHTML(data)
    }
    
    await sgMail.send(msg)
    */

    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ 
      success: true,
      message: 'Email enviado com sucesso'
    })

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar email' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Send email endpoint is working',
    timestamp: new Date().toISOString()
  })
}

// Função auxiliar para gerar HTML do email (opcional)
function generateEmailHTML(data: EmailRequest): string {
  const isReservation = data.type === 'reservation'
  
  return `
    <h2>${isReservation ? 'Nova Reserva' : 'Nova Mensagem'} - Armazém São Joaquim</h2>
    
    <h3>Detalhes do Contato:</h3>
    <ul>
      <li><strong>Nome:</strong> ${data.name || 'Não informado'}</li>
      <li><strong>Email:</strong> ${data.email || 'Não informado'}</li>
      <li><strong>Telefone:</strong> ${data.phone || 'Não informado'}</li>
    </ul>
    
    ${isReservation ? `
      <h3>Detalhes da Reserva:</h3>
      <ul>
        <li><strong>Data:</strong> ${data.date}</li>
        <li><strong>Horário:</strong> ${data.time}</li>
        <li><strong>Número de Pessoas:</strong> ${data.people}</li>
      </ul>
    ` : ''}
    
    <h3>Mensagem:</h3>
    <p>${data.message}</p>
    
    <hr>
    <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
  `
} 