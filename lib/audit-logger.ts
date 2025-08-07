import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { cookies } from 'next/headers'

interface LogData {
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  userEmail?: string
  ipAddress?: string
  userAgent?: string
}

class AuditLogger {
  private static instance: AuditLogger
  private supabaseClient: any = null

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private async getSupabaseClient() {
    if (!this.supabaseClient) {
      const cookieStore = await cookies()
      this.supabaseClient = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch (error) {
                console.log('Erro ao definir cookies no audit logger:', error)
              }
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            flowType: 'pkce',
            storageKey: 'armazem-sao-joaquim-audit',
            debug: process.env.NODE_ENV === 'development'
          },
        }
      )
    }
    return this.supabaseClient
  }

  async log(logData: LogData, request?: any): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient()

      // Obter informações do usuário atual se não fornecidas
      let userEmail = logData.userEmail
      if (!userEmail && request) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          userEmail = session?.user?.email
        } catch (error) {
          console.log('Não foi possível obter sessão para auditoria:', error)
        }
      }

      // Obter informações da requisição se disponível
      let ipAddress = logData.ipAddress
      let userAgent = logData.userAgent

      if (request && request.headers) {
        const forwardedFor = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        ipAddress = ipAddress || forwardedFor?.split(',')[0] || realIp || 'Unknown'
        userAgent = userAgent || request.headers.get('user-agent') || 'Unknown'
      }

      // Tentar inserir o log na tabela
      const { error } = await supabase
        .from('admin_activity_logs')
        .insert({
          action: logData.action,
          resource_type: logData.resource_type,
          resource_id: logData.resource_id || null,
          details: logData.details || {},
          user_email: userEmail || 'system',
          ip_address: ipAddress || 'Unknown',
          user_agent: userAgent || 'Unknown',
          created_at: new Date().toISOString()
        })

      if (error) {
        // Log em fallback se a inserção falhar
        console.error('Erro ao registrar log de auditoria:', error)
        console.log('Log de auditoria (fallback):', {
          timestamp: new Date().toISOString(),
          user: userEmail || 'system',
          action: logData.action,
          resource: logData.resource_type,
          resource_id: logData.resource_id,
          details: logData.details,
          ip: ipAddress,
          error: error.message
        })
      }

    } catch (error) {
      // Fallback para console se tudo falhar
      console.error('Erro crítico no audit logger:', error)
      console.log('Log de auditoria (console fallback):', {
        timestamp: new Date().toISOString(),
        ...logData,
        error: (error as Error).message
      })
    }
  }

  // Métodos de conveniência para ações comuns
  async logCreate(resourceType: string, resourceId: string, details?: any, request?: any) {
    await this.log({
      action: 'create',
      resource_type: resourceType,
      resource_id: resourceId,
      details
    }, request)
  }

  async logUpdate(resourceType: string, resourceId: string, details?: any, request?: any) {
    await this.log({
      action: 'update',
      resource_type: resourceType,
      resource_id: resourceId,
      details
    }, request)
  }

  async logDelete(resourceType: string, resourceId: string, details?: any, request?: any) {
    await this.log({
      action: 'delete',
      resource_type: resourceType,
      resource_id: resourceId,
      details
    }, request)
  }

  async logView(resourceType: string, resourceId?: string, details?: any, request?: any) {
    await this.log({
      action: 'view',
      resource_type: resourceType,
      resource_id: resourceId,
      details
    }, request)
  }

  async logLogin(userEmail: string, details?: any, request?: any) {
    await this.log({
      action: 'login',
      resource_type: 'auth',
      userEmail,
      details
    }, request)
  }

  async logLogout(userEmail: string, details?: any, request?: any) {
    await this.log({
      action: 'logout',
      resource_type: 'auth',
      userEmail,
      details
    }, request)
  }

  async logExport(resourceType: string, details?: any, request?: any) {
    await this.log({
      action: 'export',
      resource_type: resourceType,
      details
    }, request)
  }

  async logImport(resourceType: string, details?: any, request?: any) {
    await this.log({
      action: 'import',
      resource_type: resourceType,
      details
    }, request)
  }

  async logSystemAction(action: string, details?: any, request?: any) {
    await this.log({
      action,
      resource_type: 'system',
      details
    }, request)
  }
}

// Exportar instância singleton
export const auditLogger = AuditLogger.getInstance()

// Função utilitária para uso em APIs
export async function logActivity(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any,
  request?: any
) {
  await auditLogger.log({
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details
  }, request)
}

// Hook para componentes React (use apenas em server components)
export function useAuditLogger() {
  return {
    logCreate: auditLogger.logCreate.bind(auditLogger),
    logUpdate: auditLogger.logUpdate.bind(auditLogger),
    logDelete: auditLogger.logDelete.bind(auditLogger),
    logView: auditLogger.logView.bind(auditLogger),
    logCustom: auditLogger.log.bind(auditLogger)
  }
}