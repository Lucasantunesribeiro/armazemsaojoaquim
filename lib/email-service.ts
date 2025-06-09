// Serviço de Email para confirmações de reserva
import { ENV } from './config'

interface EmailData {
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  occasion?: string
  requests?: string
  reservationId: string
}

export class EmailService {
  // Template de email de confirmação
  private getConfirmationEmailTemplate(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmação de Reserva - Armazém São Joaquim</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #D97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail { margin: 15px 0; }
          .detail strong { color: #8B4513; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .button { display: inline-block; background: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Armazém São Joaquim</h1>
            <p>"En esta casa tenemos memoria"</p>
          </div>
          
          <div class="content">
            <h2>Confirmação de Reserva</h2>
            <p>Olá <strong>${data.name}</strong>,</p>
            
            <p>Recebemos sua solicitação de reserva e estamos muito felizes em recebê-lo(a) em nosso restaurante histórico!</p>
            
            <h3>Detalhes da Reserva:</h3>
            <div class="detail"><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="detail"><strong>Horário:</strong> ${data.time}</div>
            <div class="detail"><strong>Número de pessoas:</strong> ${data.guests}</div>
            ${data.occasion ? `<div class="detail"><strong>Ocasião:</strong> ${data.occasion}</div>` : ''}
            ${data.requests ? `<div class="detail"><strong>Solicitações especiais:</strong> ${data.requests}</div>` : ''}
            <div class="detail"><strong>Código da reserva:</strong> ${data.reservationId}</div>
            
            <p><strong>Status:</strong> Sua reserva está em análise e será confirmada em até 24 horas.</p>
            
            <p>Entraremos em contato através do telefone <strong>${data.phone}</strong> ou deste email para confirmar todos os detalhes.</p>
            
            <h3>Informações Importantes:</h3>
            <ul>
              <li>Chegue com 15 minutos de antecedência</li>
              <li>Tolerância de 15 minutos após o horário reservado</li>
              <li>Para cancelamentos, entre em contato até 2 horas antes</li>
              <li>Mesa reservada por 2 horas</li>
            </ul>
            
            <h3>Localização:</h3>
            <p>
              <strong>Rua São Joaquim, 123 - Santa Teresa<br>
              Rio de Janeiro - RJ, 20241-080</strong>
            </p>
            
            <p>Caso precise de mais informações, não hesite em nos contatar:</p>
            <ul>
              <li><strong>Telefone:</strong> (21) 98765-4321</li>
              <li><strong>Email:</strong> contato@armazemsaojoaquim.com.br</li>
              <li><strong>WhatsApp:</strong> (21) 98765-4321</li>
            </ul>
            
            <div class="footer">
              <p>Esperamos você em nosso ambiente histórico e acolhedor!</p>
              <p><em>Equipe Armazém São Joaquim</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Template de email de confirmação final
  private getConfirmedEmailTemplate(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reserva Confirmada - Armazém São Joaquim</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .confirmed { background: #d1fae5; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .detail { margin: 15px 0; }
          .detail strong { color: #8B4513; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Reserva Confirmada!</h1>
            <p>Armazém São Joaquim</p>
          </div>
          
          <div class="content">
            <div class="confirmed">
              <h2>🎉 Sua mesa está reservada!</h2>
              <p>Confirmamos sua reserva para <strong>${new Date(data.date).toLocaleDateString('pt-BR')}</strong> às <strong>${data.time}</strong></p>
            </div>
            
            <p>Olá <strong>${data.name}</strong>,</p>
            
            <p>É com grande prazer que confirmamos sua reserva no Armazém São Joaquim. Estamos ansiosos para recebê-lo(a) em nosso ambiente histórico!</p>
            
            <h3>Detalhes Confirmados:</h3>
            <div class="detail"><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="detail"><strong>Horário:</strong> ${data.time}</div>
            <div class="detail"><strong>Pessoas:</strong> ${data.guests}</div>
            <div class="detail"><strong>Código:</strong> ${data.reservationId}</div>
            
            <p><strong>Lembre-se:</strong></p>
            <ul>
              <li>Chegue 15 minutos antes do horário</li>
              <li>Apresente este email ou cite o código da reserva</li>
              <li>Mesa reservada por 2 horas</li>
            </ul>
            
            <div class="footer">
              <p>Até breve no Armazém São Joaquim!</p>
              <p><em>170 anos de história esperando por você</em></p>
            </div>
          </div>
        </div>
      </div>
      </html>
    `
  }

  // Simular envio de email (em produção, integrar com SendGrid, Resend, etc.)
  async sendConfirmationEmail(data: EmailData): Promise<boolean> {
    try {
      console.log('📧 Enviando email de confirmação para:', data.email)
      console.log('Template:', this.getConfirmationEmailTemplate(data))
      
      // Em produção, substituir por:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: data.email,
      //     subject: 'Confirmação de Reserva - Armazém São Joaquim',
      //     html: this.getConfirmationEmailTemplate(data)
      //   })
      // })
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error)
      return false
    }
  }

  async sendConfirmedEmail(data: EmailData): Promise<boolean> {
    try {
      console.log('📧 Enviando email de confirmação final para:', data.email)
      console.log('Template:', this.getConfirmedEmailTemplate(data))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Erro ao enviar email final:', error)
      return false
    }
  }

  async sendCancellationEmail(data: Partial<EmailData>): Promise<boolean> {
    try {
      console.log('📧 Enviando email de cancelamento para:', data.email)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return true
    } catch (error) {
      console.error('Erro ao enviar email de cancelamento:', error)
      return false
    }
  }

  // Integração futura com serviços de email
  async setupEmailService() {
    // Configuração para SendGrid, Resend, etc.
    if (ENV.IS_PRODUCTION) {
      // return new SendGridEmailService(process.env.SENDGRID_API_KEY)
      // return new ResendEmailService(process.env.RESEND_API_KEY)
    }
    return this
  }
}

export const emailService = new EmailService() 