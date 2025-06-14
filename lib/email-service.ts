import { Resend } from 'resend';
import { ENV } from './config';
import { ReservationConfirmation } from '../components/email-templates/ReservationConfirmation';
import { AdminNotification } from '../components/email-templates/AdminNotification';

// Inicializar Resend
const resend = new Resend(ENV.RESEND_API_KEY);

export interface ReservationData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  pessoas: number;
  observacoes?: string;
  confirmationToken: string;
}

export class EmailService {
  private static instance: EmailService;
  private fromEmail = 'Armazém São Joaquim <onboarding@resend.dev>';
  private adminEmail = 'armazemsaojoaquimoficial@gmail.com';
  
  // Email alternativo para resposta (opcional)
  private replyToEmail = 'armazemsaojoaquimoficial@gmail.com';

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Envia email de confirmação para o usuário
   */
  async sendReservationConfirmation(reservationData: ReservationData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!ENV.RESEND_API_KEY) {
        console.warn('❌ RESEND_API_KEY não configurada. Email não será enviado.');
        return { success: false, error: 'Configuração de email não encontrada' };
      }

      console.log('📧 Enviando email de confirmação para:', reservationData.email);

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        reply_to: this.replyToEmail, // Permite resposta para o email real
        to: [reservationData.email],
        subject: `✅ Reserva Confirmada - Armazém São Joaquim`,
        react: ReservationConfirmation({
          nome: reservationData.nome,
          data: reservationData.data,
          horario: reservationData.horario,
          pessoas: reservationData.pessoas,
          observacoes: reservationData.observacoes,
          confirmationToken: reservationData.confirmationToken,
          siteUrl: ENV.SITE_URL,
        }) as any,
      });

      if (error) {
        console.error('❌ Erro ao enviar email de confirmação:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email de confirmação enviado com sucesso:', data?.id);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no serviço de email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Envia notificação para o admin quando reserva é confirmada
   */
  async sendAdminNotification(reservationData: ReservationData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!ENV.RESEND_API_KEY) {
        console.warn('❌ RESEND_API_KEY não configurada. Email não será enviado.');
        return { success: false, error: 'Configuração de email não encontrada' };
      }

      console.log('📧 Enviando notificação admin para:', this.adminEmail);

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        reply_to: reservationData.email, // Permite resposta direta para o cliente
        to: [this.adminEmail],
        subject: `🔔 Nova Reserva Confirmada - ${reservationData.nome}`,
        react: AdminNotification({
          nome: reservationData.nome,
          email: reservationData.email,
          telefone: reservationData.telefone,
          data: reservationData.data,
          horario: reservationData.horario,
          pessoas: reservationData.pessoas,
          observacoes: reservationData.observacoes,
          reservationId: reservationData.id,
        }) as any,
      });

      if (error) {
        console.error('❌ Erro ao enviar notificação para admin:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notificação para admin enviada com sucesso:', data?.id);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no serviço de email para admin:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Envia email simples (para outros usos)
   */
  async sendSimpleEmail({
    to,
    subject,
    html,
    text,
    replyTo
  }: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!ENV.RESEND_API_KEY) {
        console.warn('❌ RESEND_API_KEY não configurada. Email não será enviado.');
        return { success: false, error: 'Configuração de email não encontrada' };
      }

      const emailOptions: any = {
        from: this.fromEmail,
        to: [to],
        subject,
      };

      if (replyTo) emailOptions.reply_to = replyTo;
      if (html) emailOptions.html = html;
      if (text) emailOptions.text = text;
      if (!html && !text) emailOptions.text = 'Email sem conteúdo';

      console.log('📧 Enviando email simples para:', to);

      const { data, error } = await resend.emails.send(emailOptions);

      if (error) {
        console.error('❌ Erro ao enviar email simples:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email simples enviado com sucesso:', data?.id);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no serviço de email simples:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Valida se o serviço de email está configurado
   */
  isConfigured(): boolean {
    return !!ENV.RESEND_API_KEY;
  }

  /**
   * Testa a configuração do email
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!ENV.RESEND_API_KEY) {
        return { success: false, error: 'RESEND_API_KEY não configurada' };
      }

      console.log('🧪 Testando configuração de email...');

      // Teste simples enviando para o próprio admin
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        reply_to: this.replyToEmail,
        to: [this.adminEmail],
        subject: '🧪 Teste de Configuração - Armazém São Joaquim',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc3545;">🧪 Teste de Configuração</h1>
            <p>Este é um email de teste para verificar a configuração do Resend.</p>
            <p><strong>Status:</strong> ✅ Email service funcionando corretamente!</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              Enviado de: ${this.fromEmail}<br>
              Sistema: Armazém São Joaquim
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Erro no teste:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Teste enviado com sucesso:', data?.id);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no teste de configuração:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Retorna informações sobre a configuração atual
   */
  getConfiguration() {
    return {
      isConfigured: this.isConfigured(),
      fromEmail: this.fromEmail,
      adminEmail: this.adminEmail,
      replyToEmail: this.replyToEmail,
      hasApiKey: !!ENV.RESEND_API_KEY
    };
  }
}

// Exportar instância singleton
export const emailService = EmailService.getInstance(); 