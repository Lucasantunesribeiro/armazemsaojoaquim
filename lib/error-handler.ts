import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { auditLogger } from './audit-logger'

// Tipos de erro personalizados
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  public readonly validationErrors: string[]

  constructor(message: string, validationErrors: string[] = []) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.validationErrors = validationErrors
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, true, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados') {
    super(message, 409, true, 'CONFLICT_ERROR')
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados') {
    super(message, 500, true, 'DATABASE_ERROR')
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'Erro em serviço externo') {
    super(message, 502, true, 'EXTERNAL_SERVICE_ERROR')
  }
}

// Interface para resposta de erro padronizada
interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    statusCode: number
    validationErrors?: string[]
    requestId?: string
    timestamp: string
  }
}

// Classe principal para tratamento de erros
export class ErrorHandler {
  private static instance: ErrorHandler

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Método principal para tratar erros em APIs
  async handleError(error: unknown, request?: any): Promise<NextResponse<ErrorResponse>> {
    const requestId = this.generateRequestId()
    
    // Log do erro
    console.error(`[ERROR ${requestId}]`, error)

    // Determinar o tipo de erro e criar resposta apropriada
    let errorResponse: ErrorResponse

    if (error instanceof AppError) {
      errorResponse = this.handleAppError(error, requestId)
    } else if (error instanceof ZodError) {
      errorResponse = this.handleZodError(error, requestId)
    } else if (error instanceof Error) {
      errorResponse = this.handleGenericError(error, requestId)
    } else {
      errorResponse = this.handleUnknownError(requestId)
    }

    // Log de auditoria para erros críticos
    if (errorResponse.error.statusCode >= 500) {
      try {
        await auditLogger.logSystemAction('error', {
          error_type: errorResponse.error.code || 'UNKNOWN_ERROR',
          error_message: errorResponse.error.message,
          request_id: requestId,
          stack: error instanceof Error ? error.stack : undefined
        }, request)
      } catch (auditError) {
        console.error('Erro ao registrar log de auditoria:', auditError)
      }
    }

    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode
    })
  }

  private handleAppError(error: AppError, requestId: string): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        requestId,
        timestamp: new Date().toISOString()
      }
    }

    if (error instanceof ValidationError) {
      response.error.validationErrors = error.validationErrors
    }

    return response
  }

  private handleZodError(error: ZodError, requestId: string): ErrorResponse {
    const validationErrors = error.errors.map(err => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
      return `${path}${err.message}`
    })

    return {
      success: false,
      error: {
        message: 'Dados de entrada inválidos',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        validationErrors,
        requestId,
        timestamp: new Date().toISOString()
      }
    }
  }

  private handleGenericError(error: Error, requestId: string): ErrorResponse {
    // Mapear erros comuns do Supabase
    if (error.message.includes('duplicate key value')) {
      return {
        success: false,
        error: {
          message: 'Registro duplicado',
          code: 'DUPLICATE_ENTRY',
          statusCode: 409,
          requestId,
          timestamp: new Date().toISOString()
        }
      }
    }

    if (error.message.includes('foreign key constraint')) {
      return {
        success: false,
        error: {
          message: 'Violação de integridade referencial',
          code: 'FOREIGN_KEY_VIOLATION',
          statusCode: 400,
          requestId,
          timestamp: new Date().toISOString()
        }
      }
    }

    if (error.message.includes('permission denied') || error.message.includes('RLS')) {
      return {
        success: false,
        error: {
          message: 'Acesso negado',
          code: 'PERMISSION_DENIED',
          statusCode: 403,
          requestId,
          timestamp: new Date().toISOString()
        }
      }
    }

    if (error.message.includes('connection') || error.message.includes('timeout')) {
      return {
        success: false,
        error: {
          message: 'Erro de conexão com o banco de dados',
          code: 'CONNECTION_ERROR',
          statusCode: 503,
          requestId,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Erro genérico
    return {
      success: false,
      error: {
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        requestId,
        timestamp: new Date().toISOString()
      }
    }
  }

  private handleUnknownError(requestId: string): ErrorResponse {
    return {
      success: false,
      error: {
        message: 'Erro desconhecido',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        requestId,
        timestamp: new Date().toISOString()
      }
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // Método para tratar erros síncronos
  handleSyncError(error: unknown): never {
    if (error instanceof AppError) {
      throw error
    }

    if (error instanceof Error) {
      throw new AppError(
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Erro interno',
        500,
        false
      )
    }

    throw new AppError('Erro desconhecido', 500, false)
  }
}

// Wrapper para APIs com tratamento de erro automático
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ErrorResponse>> => {
    try {
      return await handler(...args)
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance()
      
      // Tentar extrair request do primeiro argumento se for NextRequest
      const request = args[0] && typeof args[0] === 'object' && 'headers' in args[0] 
        ? args[0] as any 
        : undefined
      
      return errorHandler.handleError(error, request)
    }
  }
}

// Instância singleton
export const errorHandler = ErrorHandler.getInstance()

// Funções utilitárias para lançar erros específicos
export function throwValidationError(message: string, validationErrors: string[] = []) {
  throw new ValidationError(message, validationErrors)
}

export function throwAuthenticationError(message?: string) {
  throw new AuthenticationError(message)
}

export function throwAuthorizationError(message?: string) {
  throw new AuthorizationError(message)
}

export function throwNotFoundError(message?: string) {
  throw new NotFoundError(message)
}

export function throwConflictError(message?: string) {
  throw new ConflictError(message)
}

export function throwDatabaseError(message?: string) {
  throw new DatabaseError(message)
}

export function throwExternalServiceError(message?: string) {
  throw new ExternalServiceError(message)
}

// Middleware para capturar erros não tratados
export function setupErrorHandling() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Não encerrar o processo em produção para evitar downtime
    if (process.env.NODE_ENV === 'development') {
      process.exit(1)
    }
  })

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    // Registrar no audit log
    auditLogger.logSystemAction('uncaught_exception', {
      error_message: error.message,
      error_stack: error.stack
    }).catch(console.error)
    
    process.exit(1)
  })
}

// Hook para React (client-side)
export function useErrorHandler() {
  const handleError = (error: unknown, fallbackMessage?: string) => {
    console.error('Client error:', error)
    
    if (error instanceof Error) {
      return {
        message: fallbackMessage || error.message,
        isError: true
      }
    }
    
    return {
      message: fallbackMessage || 'Ocorreu um erro inesperado',
      isError: true
    }
  }

  return { handleError }
}