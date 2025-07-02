'use client'

import emailjs from '@emailjs/browser'

// Configurações EmailJS fornecidas pelo usuário
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'g-gdzBLucmE8eoUlq',
  SERVICE_ID: 'service_gxo49v9',
  TEMPLATE_CLIENT: 'template_6z7ja2t',
  TEMPLATE_RESTAURANT: 'template_pnnqpyf',
  CORPORATE_EMAIL: 'armazemsaojoaquimoficial@gmail.com'
}

export interface ReservationData {
  id: string
  nome: string
  email: string
  telefone: string
  data: string
  horario: string
  pessoas: number
  observacoes?: string
  tokenConfirmacao: string
}

export class EmailJSService {
  private static instance: EmailJSService
  private isInitialized = false

  private constructor() {
    this.initializeEmailJS()
  }

  public static getInstance(): EmailJSService {
    if (!EmailJSService.instance) {
      EmailJSService.instance = new EmailJSService()
    }
    return EmailJSService.instance
  }

  private initializeEmailJS(): void {
    try {
      // Verificar se está no cliente
      if (typeof window === 'undefined') {
        console.warn('EmailJS só pode ser inicializado no lado do cliente')
        return
      }

      emailjs.init({
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        blockHeadless: true,
        limitRate: {
          id: 'app',
          throttle: 10000,
        },
      })

      this.isInitialized = true
      console.log('✅ EmailJS inicializado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar EmailJS:', error)
      throw new Error('Falha na inicialização do EmailJS')
    }
  }

  private verificarClienteSide(): void {
    if (typeof window === 'undefined') {
      throw new Error('EmailJS só pode ser usado no lado do cliente')
    }
    if (!this.isInitialized) {
      throw new Error('EmailJS não foi inicializado')
    }
  }

  public gerarToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36)
  }

  public gerarUrlConfirmacao(token: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    return `${baseUrl}/api/reservas/confirm?token=${token}`
  }

  public async enviarEmailConfirmacao(reserva: ReservationData): Promise<{ success: boolean; error?: string }> {
    try {
      this.verificarClienteSide()

      const templateParams = {
        // CAMPOS PRINCIPAIS PARA DESTINATÁRIO (EmailJS requer estes)
        to: reserva.email,
        email: reserva.email,
        to_email: reserva.email,
        recipient_email: reserva.email,
        
        // INFORMAÇÕES DO DESTINATÁRIO
        to_name: reserva.nome,
        customer_name: reserva.nome,
        
        // DADOS DA RESERVA
        reservation_id: reserva.id,
        customer_email: reserva.email,
        customer_phone: reserva.telefone,
        reservation_date: this.formatarData(reserva.data),
        reservation_time: reserva.horario,
        guest_count: reserva.pessoas.toString(),
        special_requests: reserva.observacoes || 'Nenhuma observação especial',
        confirmation_link: this.gerarUrlConfirmacao(reserva.tokenConfirmacao),
        
        // DADOS DO RESTAURANTE
        restaurant_name: 'Armazém São Joaquim',
        restaurant_address: 'Rua São Joaquim, 123 - Centro',
        restaurant_phone: '(11) 9999-9999'
      }

      console.log('📧 Enviando email de confirmação para:', reserva.email)
      console.log('📋 Parâmetros do template:', {
        to: templateParams.to,
        email: templateParams.email,
        to_email: templateParams.to_email,
        recipient_email: templateParams.recipient_email,
        to_name: templateParams.to_name
      })

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_CLIENT,
        templateParams
      )

      console.log('✅ Email de confirmação enviado:', result.status, result.text)
      return { success: true }

    } catch (error: any) {
      console.error('❌ Erro ao enviar email de confirmação:', error)
      
      // TRATAMENTO ESPECÍFICO PARA ERRO 422 DO EMAILJS
      if (error?.status === 422 || (error?.text && error.text.includes('422'))) {
        console.error('🚨 EMAILJS RETORNOU ERRO 422 - DETALHES:', {
          status: error.status,
          text: error.text,
          serviceId: EMAILJS_CONFIG.SERVICE_ID,
          templateId: EMAILJS_CONFIG.TEMPLATE_CLIENT,
          publicKey: EMAILJS_CONFIG.PUBLIC_KEY?.substring(0, 10) + '***',
          reservaInfo: {
            nome: reserva.nome,
            email: reserva.email,
            data: reserva.data,
            horario: reserva.horario
          }
        })
        
        return {
          success: false,
          error: 'Erro 422 - Dados inválidos para o serviço de email (EmailJS)'
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email'
      }
    }
  }

  public async enviarNotificacaoRestaurante(reserva: ReservationData): Promise<{ success: boolean; error?: string }> {
    try {
      this.verificarClienteSide()

      const templateParams = {
        // CAMPOS PRINCIPAIS PARA DESTINATÁRIO (EmailJS requer estes)
        to: EMAILJS_CONFIG.CORPORATE_EMAIL,
        email: EMAILJS_CONFIG.CORPORATE_EMAIL,
        to_email: EMAILJS_CONFIG.CORPORATE_EMAIL,
        recipient_email: EMAILJS_CONFIG.CORPORATE_EMAIL,
        
        // INFORMAÇÕES DO DESTINATÁRIO
        to_name: 'Armazém São Joaquim',
        
        // DADOS DA RESERVA
        reservation_id: reserva.id,
        customer_name: reserva.nome,
        customer_email: reserva.email,
        customer_phone: reserva.telefone,
        reservation_date: this.formatarData(reserva.data),
        reservation_time: reserva.horario,
        guest_count: reserva.pessoas.toString(),
        special_requests: reserva.observacoes || 'Nenhuma observação especial',
        created_at: new Date().toLocaleString('pt-BR'),
        
        // DADOS DO RESTAURANTE
        restaurant_name: 'Armazém São Joaquim'
      }

      console.log('📧 Enviando notificação para o restaurante:', EMAILJS_CONFIG.CORPORATE_EMAIL)

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_RESTAURANT,
        templateParams
      )

      console.log('✅ Notificação do restaurante enviada:', result.status, result.text)
      return { success: true }

    } catch (error) {
      console.error('❌ Erro ao enviar notificação do restaurante:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar notificação'
      }
    }
  }

  private formatarData(data: string): string {
    try {
      const date = new Date(data + 'T00:00:00')
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Sao_Paulo'
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return data
    }
  }

  public validarToken(token: string): boolean {
    return Boolean(token && token.length > 10 && /^[a-zA-Z0-9]+$/.test(token))
  }
}

// Instância singleton
export const emailJSService = EmailJSService.getInstance()

export default emailJSService 