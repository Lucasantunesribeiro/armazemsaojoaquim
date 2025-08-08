import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { RetryHandler, withRetry, fetchWithRetry, supabaseWithRetry } from '@/lib/retry-handler'

// Mock global fetch
global.fetch = jest.fn()

describe('RetryHandler', () => {
  let retryHandler: RetryHandler
  
  beforeEach(() => {
    retryHandler = RetryHandler.getInstance()
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success')
      
      const result = await retryHandler.executeWithRetry(mockOperation)
      
      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable error and eventually succeed', async () => {
      const retryableError = new Error('connection timeout')
      ;(retryableError as any).status = 503
      
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue('success')

      const resultPromise = retryHandler.executeWithRetry(mockOperation, {
        maxRetries: 3,
        baseDelay: 100,
        backoffFactor: 2
      })

      // Advance timers for retries
      await jest.advanceTimersByTimeAsync(100) // First retry after 100ms
      await jest.advanceTimersByTimeAsync(200) // Second retry after 200ms
      
      const result = await resultPromise
      
      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const retryableError = new Error('connection timeout')
      ;(retryableError as any).status = 503
      
      const mockOperation = jest.fn().mockRejectedValue(retryableError)

      const resultPromise = retryHandler.executeWithRetry(mockOperation, {
        maxRetries: 2,
        baseDelay: 100
      })

      // Advance timers for all retries
      await jest.advanceTimersByTimeAsync(100) // First retry
      await jest.advanceTimersByTimeAsync(200) // Second retry
      
      await expect(resultPromise).rejects.toThrow('connection timeout')
      expect(mockOperation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new Error('bad request')
      ;(nonRetryableError as any).status = 400
      
      const mockOperation = jest.fn().mockRejectedValue(nonRetryableError)

      await expect(retryHandler.executeWithRetry(mockOperation)).rejects.toThrow('bad request')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should respect custom retry condition', async () => {
      const customError = new Error('custom error')
      const mockOperation = jest.fn().mockRejectedValue(customError)

      const customRetryCondition = jest.fn().mockReturnValue(true)

      const resultPromise = retryHandler.executeWithRetry(mockOperation, {
        maxRetries: 2,
        baseDelay: 50,
        retryCondition: customRetryCondition
      })

      await jest.advanceTimersByTimeAsync(50)
      await jest.advanceTimersByTimeAsync(100)

      await expect(resultPromise).rejects.toThrow('custom error')
      expect(customRetryCondition).toHaveBeenCalledWith(customError)
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should call onRetry callback', async () => {
      const retryableError = new Error('timeout')
      ;(retryableError as any).status = 503
      
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue('success')

      const onRetryCallback = jest.fn()

      const resultPromise = retryHandler.executeWithRetry(mockOperation, {
        maxRetries: 1,
        baseDelay: 100,
        onRetry: onRetryCallback
      })

      await jest.advanceTimersByTimeAsync(100)
      const result = await resultPromise

      expect(result).toBe('success')
      expect(onRetryCallback).toHaveBeenCalledWith(retryableError, 1)
    })

    it('should respect maxDelay', async () => {
      const retryableError = new Error('timeout')
      ;(retryableError as any).status = 503
      
      const mockOperation = jest.fn().mockRejectedValue(retryableError)

      const resultPromise = retryHandler.executeWithRetry(mockOperation, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 2000,
        backoffFactor: 4 // Would normally be 1000, 4000, 16000 but capped at maxDelay
      })

      // First retry: 1000ms
      await jest.advanceTimersByTimeAsync(1000)
      
      // Second retry: should be capped at 2000ms instead of 4000ms
      await jest.advanceTimersByTimeAsync(2000)
      
      // Third retry: should be capped at 2000ms instead of 16000ms
      await jest.advanceTimersByTimeAsync(2000)

      await expect(resultPromise).rejects.toThrow('timeout')
      expect(mockOperation).toHaveBeenCalledTimes(4) // Initial + 3 retries
    })
  })

  describe('fetchWithRetry', () => {
    it('should successfully fetch data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await retryHandler.fetchWithRetry('http://test.com')

      expect(result).toEqual({ data: 'test' })
      expect(global.fetch).toHaveBeenCalledWith('http://test.com', {
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should retry on 500 error', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ error: { message: 'Server error' } })
      }
      const mockSuccessResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' })
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValue(mockSuccessResponse)

      const resultPromise = retryHandler.fetchWithRetry('http://test.com', {}, {
        baseDelay: 100,
        maxRetries: 2
      })

      await jest.advanceTimersByTimeAsync(100)
      const result = await resultPromise

      expect(result).toEqual({ data: 'success' })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on 429 (rate limiting)', async () => {
      const mockRateLimitResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValue({ error: { message: 'Rate limited' } })
      }
      const mockSuccessResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' })
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockRateLimitResponse)
        .mockResolvedValue(mockSuccessResponse)

      const resultPromise = retryHandler.fetchWithRetry('http://test.com', {}, {
        baseDelay: 50,
        maxRetries: 1
      })

      await jest.advanceTimersByTimeAsync(50)
      const result = await resultPromise

      expect(result).toEqual({ data: 'success' })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry on 400 error', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: { message: 'Bad request' } })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse)

      await expect(
        retryHandler.fetchWithRetry('http://test.com')
      ).rejects.toThrow('Bad request')

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('supabaseWithRetry', () => {
    it('should succeed with valid data', async () => {
      const mockOperation = jest.fn().mockResolvedValue({
        data: { id: 1, name: 'test' },
        error: null
      })

      const result = await retryHandler.supabaseWithRetry(mockOperation)

      expect(result).toEqual({ id: 1, name: 'test' })
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on connection error', async () => {
      const connectionError = {
        code: 'PGRST301',
        message: 'Connection timeout'
      }

      const mockOperation = jest.fn()
        .mockResolvedValueOnce({ data: null, error: connectionError })
        .mockResolvedValue({ data: { id: 1, name: 'test' }, error: null })

      const resultPromise = retryHandler.supabaseWithRetry(mockOperation, {
        baseDelay: 100,
        maxRetries: 1
      })

      await jest.advanceTimersByTimeAsync(100)
      const result = await resultPromise

      expect(result).toEqual({ id: 1, name: 'test' })
      expect(mockOperation).toHaveBeenCalledTimes(2)
    })

    it('should not retry on validation error', async () => {
      const validationError = {
        code: '23505', // Unique violation - not retryable
        message: 'duplicate key value'
      }

      const mockOperation = jest.fn().mockResolvedValue({
        data: null,
        error: validationError
      })

      await expect(
        retryHandler.supabaseWithRetry(mockOperation)
      ).rejects.toThrow('duplicate key value')

      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should throw error when data is null without error', async () => {
      const mockOperation = jest.fn().mockResolvedValue({
        data: null,
        error: null
      })

      await expect(
        retryHandler.supabaseWithRetry(mockOperation)
      ).rejects.toThrow('Nenhum dado retornado')
    })
  })

  describe('Utility Functions', () => {
    it('withRetry should work correctly', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success')
      
      const result = await withRetry(mockOperation)
      
      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('fetchWithRetry should work correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await fetchWithRetry('http://test.com')

      expect(result).toEqual({ data: 'test' })
    })

    it('supabaseWithRetry should work correctly', async () => {
      const mockOperation = jest.fn().mockResolvedValue({
        data: { id: 1 },
        error: null
      })

      const result = await supabaseWithRetry(mockOperation)

      expect(result).toEqual({ id: 1 })
    })
  })

  describe('RetryHandler singleton', () => {
    it('should return same instance', () => {
      const instance1 = RetryHandler.getInstance()
      const instance2 = RetryHandler.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })
})