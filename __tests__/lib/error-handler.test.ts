import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  ErrorHandler,
  throwValidationError,
  throwAuthenticationError,
  throwAuthorizationError,
  throwNotFoundError,
  useErrorHandler
} from '@/lib/error-handler'
import { ZodError, z } from 'zod'

// Mock do audit logger
jest.mock('@/lib/audit-logger', () => ({
  auditLogger: {
    logSystemAction: jest.fn().mockResolvedValue(undefined)
  }
}))

describe('Error Handler', () => {
  let errorHandler: ErrorHandler
  let mockRequest: Partial<NextRequest>

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance()
    mockRequest = {
      headers: new Headers({
        'user-agent': 'test-agent',
        'x-forwarded-for': '192.168.1.1'
      })
    }
    jest.clearAllMocks()
  })

  describe('Custom Error Classes', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 400, true, 'TEST_ERROR')
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('AppError')
    })

    it('should create ValidationError with validation errors', () => {
      const validationErrors = ['Field is required', 'Invalid format']
      const error = new ValidationError('Validation failed', validationErrors)
      
      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.validationErrors).toEqual(validationErrors)
    })

    it('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError()
      
      expect(error.message).toBe('Não autorizado')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTHENTICATION_ERROR')
    })

    it('should create AuthorizationError with custom message', () => {
      const error = new AuthorizationError('Admin access required')
      
      expect(error.message).toBe('Admin access required')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('AUTHORIZATION_ERROR')
    })

    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError()
      
      expect(error.message).toBe('Recurso não encontrado')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND_ERROR')
    })

    it('should create ConflictError with custom message', () => {
      const error = new ConflictError('Resource already exists')
      
      expect(error.message).toBe('Resource already exists')
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT_ERROR')
    })

    it('should create DatabaseError with default message', () => {
      const error = new DatabaseError()
      
      expect(error.message).toBe('Erro no banco de dados')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('DATABASE_ERROR')
    })

    it('should create ExternalServiceError with custom message', () => {
      const error = new ExternalServiceError('API unavailable')
      
      expect(error.message).toBe('API unavailable')
      expect(error.statusCode).toBe(502)
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
    })
  })

  describe('Error Throwing Functions', () => {
    it('should throw ValidationError', () => {
      const validationErrors = ['Invalid input']
      
      expect(() => {
        throwValidationError('Validation failed', validationErrors)
      }).toThrow(ValidationError)
    })

    it('should throw AuthenticationError', () => {
      expect(() => {
        throwAuthenticationError('Login required')
      }).toThrow(AuthenticationError)
    })

    it('should throw AuthorizationError', () => {
      expect(() => {
        throwAuthorizationError('Access denied')
      }).toThrow(AuthorizationError)
    })

    it('should throw NotFoundError', () => {
      expect(() => {
        throwNotFoundError('Resource not found')
      }).toThrow(NotFoundError)
    })
  })

  describe('ErrorHandler.handleError', () => {
    it('should handle AppError correctly', async () => {
      const appError = new ValidationError('Invalid data', ['Field is required'])
      
      const response = await errorHandler.handleError(appError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.message).toBe('Invalid data')
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.validationErrors).toEqual(['Field is required'])
      expect(body.error.requestId).toBeDefined()
      expect(body.error.timestamp).toBeDefined()
    })

    it('should handle ZodError correctly', async () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email')
      })
      
      let zodError: ZodError
      try {
        schema.parse({ name: '', email: 'invalid-email' })
      } catch (error) {
        zodError = error as ZodError
      }
      
      const response = await errorHandler.handleError(zodError!, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.message).toBe('Dados de entrada inválidos')
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.validationErrors).toContain('name: Name is required')
      expect(body.error.validationErrors).toContain('email: Invalid email')
    })

    it('should handle database duplicate key error', async () => {
      const dbError = new Error('duplicate key value violates unique constraint')
      
      const response = await errorHandler.handleError(dbError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(409)
      expect(body.error.message).toBe('Registro duplicado')
      expect(body.error.code).toBe('DUPLICATE_ENTRY')
    })

    it('should handle database foreign key error', async () => {
      const dbError = new Error('foreign key constraint violation')
      
      const response = await errorHandler.handleError(dbError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.error.message).toBe('Violação de integridade referencial')
      expect(body.error.code).toBe('FOREIGN_KEY_VIOLATION')
    })

    it('should handle permission denied error', async () => {
      const permError = new Error('permission denied for table users')
      
      const response = await errorHandler.handleError(permError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(403)
      expect(body.error.message).toBe('Acesso negado')
      expect(body.error.code).toBe('PERMISSION_DENIED')
    })

    it('should handle connection error', async () => {
      const connError = new Error('connection timeout')
      
      const response = await errorHandler.handleError(connError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(503)
      expect(body.error.message).toBe('Erro de conexão com o banco de dados')
      expect(body.error.code).toBe('CONNECTION_ERROR')
    })

    it('should handle unknown error', async () => {
      const unknownError = { some: 'unknown error object' }
      
      const response = await errorHandler.handleError(unknownError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(500)
      expect(body.error.message).toBe('Erro desconhecido')
      expect(body.error.code).toBe('UNKNOWN_ERROR')
    })

    it('should handle generic Error in development', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const genericError = new Error('Development error message')
      
      const response = await errorHandler.handleError(genericError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(500)
      expect(body.error.message).toBe('Development error message')
      expect(body.error.code).toBe('INTERNAL_ERROR')
      
      process.env.NODE_ENV = originalEnv
    })

    it('should handle generic Error in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const genericError = new Error('Internal error details')
      
      const response = await errorHandler.handleError(genericError, mockRequest)
      const body = await response.json()
      
      expect(response.status).toBe(500)
      expect(body.error.message).toBe('Erro interno do servidor')
      expect(body.error.code).toBe('INTERNAL_ERROR')
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('useErrorHandler hook', () => {
    it('should handle Error correctly', () => {
      const { handleError } = useErrorHandler()
      const error = new Error('Test error')
      
      const result = handleError(error)
      
      expect(result.message).toBe('Test error')
      expect(result.isError).toBe(true)
    })

    it('should handle unknown error with fallback', () => {
      const { handleError } = useErrorHandler()
      const unknownError = { some: 'object' }
      
      const result = handleError(unknownError, 'Custom fallback')
      
      expect(result.message).toBe('Custom fallback')
      expect(result.isError).toBe(true)
    })

    it('should use default fallback message', () => {
      const { handleError } = useErrorHandler()
      const unknownError = { some: 'object' }
      
      const result = handleError(unknownError)
      
      expect(result.message).toBe('Ocorreu um erro inesperado')
      expect(result.isError).toBe(true)
    })
  })

  describe('ErrorHandler singleton', () => {
    it('should return same instance', () => {
      const instance1 = ErrorHandler.getInstance()
      const instance2 = ErrorHandler.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })
})