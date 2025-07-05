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
  
  // Email do desenvolvedor para modo sandbox
  private developerEmail = 'lucas.afvr@gmail.com';

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
        subject: `📧 Confirme sua Reserva - Armazém São Joaquim`,
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
   * Detecta se estamos em modo sandbox (desenvolvimento)
   */
  private isSandboxMode(): boolean {
    return this.fromEmail.includes('onboarding@resend.dev');
  }

  /**
   * Retorna o email de destino correto baseado no modo
   */
  private getAdminEmailForMode(): string {
    if (this.isSandboxMode()) {
      console.log('🧪 Modo SANDBOX detectado - enviando para email do desenvolvedor');
      return this.developerEmail;
    }
    return this.adminEmail;
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

      const destinationEmail = this.getAdminEmailForMode();
      console.log('📧 Enviando notificação admin para:', destinationEmail);
      
      if (this.isSandboxMode()) {
        console.log('⚠️  MODO SANDBOX: Email será enviado para', destinationEmail, 'em vez de', this.adminEmail);
        console.log('💡 Para enviar para o email real, configure um domínio verificado no Resend');
      }

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        reply_to: reservationData.email, // Permite resposta direta para o cliente
        to: [destinationEmail],
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
        
        // Se falhar e estivermos em sandbox, tentar com email do desenvolvedor
        if (error.message?.includes('validation_error') && !this.isSandboxMode()) {
          console.log('🔄 Tentando enviar para email do desenvolvedor devido a erro de validação...');
          return this.sendAdminNotificationFallback(reservationData);
        }
        
        return { success: false, error: error.message };
      }

      console.log('✅ Notificação para admin enviada com sucesso:', data?.id);
      
      if (this.isSandboxMode()) {
        console.log('📝 NOTA: Em produção, este email seria enviado para:', this.adminEmail);
      }
      
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
   * Fallback para enviar notificação quando há erro de validação
   */
  private async sendAdminNotificationFallback(reservationData: ReservationData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 FALLBACK: Enviando para email do desenvolvedor');
      
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        reply_to: reservationData.email,
        to: [this.developerEmail],
        subject: `🔔 [SANDBOX] Nova Reserva Confirmada - ${reservationData.nome}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #ffc107; color: #212529; padding: 15px; text-align: center; margin-bottom: 20px;">
              <h2 style="margin: 0;">⚠️ MODO SANDBOX - RESEND</h2>
              <p style="margin: 5px 0 0 0;">Este email deveria ser enviado para: <strong>${this.adminEmail}</strong></p>
            </div>
            
            <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🔔 Nova Reserva Confirmada</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Armazém São Joaquim - Sistema de Reservas</p>
            </div>
            
            <div style="padding: 30px 20px; background-color: #ffffff;">
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 0 0 25px 0;">
                <p style="margin: 0; font-size: 16px; color: #155724; font-weight: bold;">✅ Uma nova reserva foi confirmada pelo cliente!</p>
              </div>
              
              <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #dc3545; margin-top: 0;">👤 Dados do Cliente</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="margin-bottom: 10px;"><strong>Nome Completo:</strong> ${reservationData.nome}</li>
                  <li style="margin-bottom: 10px;"><strong>E-mail:</strong> <a href="mailto:${reservationData.email}" style="color: #007bff; margin-left: 5px;">${reservationData.email}</a></li>
                  <li style="margin-bottom: 10px;"><strong>Telefone:</strong> <a href="tel:${reservationData.telefone}" style="color: #007bff; margin-left: 5px;">${reservationData.telefone}</a></li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">📅 Detalhes da Reserva</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="margin-bottom: 10px;"><strong>📅 Data:</strong> ${new Date(reservationData.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li style="margin-bottom: 10px;"><strong>🕐 Horário:</strong> ${reservationData.horario}</li>
                  <li style="margin-bottom: 10px;"><strong>👥 Número de Pessoas:</strong> ${reservationData.pessoas} ${reservationData.pessoas === 1 ? 'pessoa' : 'pessoas'}</li>
                  <li style="margin-bottom: 10px;"><strong>🆔 ID da Reserva:</strong> ${reservationData.id}</li>
                  ${reservationData.observacoes ? `<li style="margin-bottom: 10px;"><strong>📝 Observações:</strong> ${reservationData.observacoes}</li>` : ''}
                </ul>
              </div>
              
              <div style="background-color: #ffc107; border: 1px solid #ffca2c; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #212529; font-weight: bold;">
                  ⚠️ IMPORTANTE: Para receber emails no endereço real (${this.adminEmail}), 
                  configure um domínio verificado no Resend.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0 0 10px 0;">
                <strong>Sistema de Reservas - Armazém São Joaquim</strong><br/>
                Este email foi enviado automaticamente quando o cliente confirmou a reserva.
              </p>
              <p style="margin: 0;">Data/Hora do envio: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Erro no fallback:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email de fallback enviado com sucesso:', data?.id);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no fallback:', error);
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
    const isSandbox = this.isSandboxMode();
    return {
      isConfigured: this.isConfigured(),
      fromEmail: this.fromEmail,
      adminEmail: this.adminEmail,
      replyToEmail: this.replyToEmail,
      hasApiKey: !!ENV.RESEND_API_KEY,
      isSandboxMode: isSandbox,
      actualDestinationEmail: this.getAdminEmailForMode(),
      developerEmail: this.developerEmail,
      note: isSandbox ? 'Modo SANDBOX: Emails serão enviados para o desenvolvedor' : 'Modo PRODUÇÃO: Emails serão enviados para o admin'
    };
  }
}

// Exportar instância singleton
export const emailService = EmailService.getInstance(); 