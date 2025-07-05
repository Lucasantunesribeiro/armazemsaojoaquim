import { NextRequest, NextResponse } from 'next/server'

// Tipos de erro personalizados
export class ApiError extends Error {
  public statusCode: number
  public code: string
  
  constructor(statusCode: number, message: string, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code || 'API_ERROR'
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, field?: string) {
    super(400, message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Erro de banco de dados') {
    super(500, message, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Não autorizado') {
    super(401, message, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado') {
    super(404, message, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

// Função para criar resposta de erro padronizada
export function createErrorResponse(
  error: string | Error | ApiError,
  statusCode: number = 500,
  code?: string
): NextResponse {
  let errorMessage: string
  let errorCode: string
  let status: number

  if (error instanceof ApiError) {
    errorMessage = error.message
    errorCode = error.code
    status = error.statusCode
  } else if (error instanceof Error) {
    errorMessage = error.message
    errorCode = code || 'INTERNAL_ERROR'
    status = statusCode
  } else {
    errorMessage = error
    errorCode = code || 'UNKNOWN_ERROR'
    status = statusCode
  }

  const errorResponse = {
    error: errorMessage,
    code: errorCode,
    timestamp: new Date().toISOString(),
    status
  }

  console.error('API Error:', errorResponse)

  return NextResponse.json(errorResponse, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Função para criar resposta de sucesso padronizada
export function createSuccessResponse(
  data: any,
  message?: string,
  statusCode: number = 200
): NextResponse {
  const response = {
    success: true,
    data,
    message: message || 'Operação realizada com sucesso',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Middleware para tratamento global de erros
export function handleApiError(error: unknown): NextResponse {
  console.error('Unhandled API error:', error)

  if (error instanceof ApiError) {
    return createErrorResponse(error)
  }

  if (error instanceof Error) {
    // Erros específicos do Next.js/Node.js
    if (error.message.includes('ECONNREFUSED')) {
      return createErrorResponse('Erro de conexão com o banco de dados', 503, 'DATABASE_CONNECTION_ERROR')
    }

    if (error.message.includes('JSON')) {
      return createErrorResponse('Dados JSON inválidos', 400, 'INVALID_JSON')
    }

    if (error.message.includes('fetch')) {
      return createErrorResponse('Erro de rede', 503, 'NETWORK_ERROR')
    }

    // Erro genérico
    return createErrorResponse(error.message, 500, 'INTERNAL_ERROR')
  }

  // Erro completamente desconhecido
  return createErrorResponse('Erro interno do servidor', 500, 'UNKNOWN_ERROR')
}

// Validador de requisição
export function validateRequest(
  body: any,
  requiredFields: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const field of requiredFields) {
    if (!body[field] && body[field] !== 0 && body[field] !== false) {
      errors.push(`Campo '${field}' é obrigatório`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validador de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validador de telefone brasileiro
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validador de data
export function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) return false
  
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

// Validador de horário
export function validateTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

// Wrapper para handlers de API com tratamento de erro automático
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Middleware para CORS
export function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handler para requisições OPTIONS (CORS preflight)
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 