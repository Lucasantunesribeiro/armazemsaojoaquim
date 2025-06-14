import { cn, formatDate, formatCurrency, validateEmail } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toContain('janeiro')
      expect(result).toContain('2024')
    })

    it('handles string dates', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('janeiro')
      expect(result).toContain('2024')
    })
  })

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('R$')
      expect(result).toContain('1.234,56')
    })

    it('handles zero values', () => {
      const result = formatCurrency(0)
      expect(result).toContain('R$')
      expect(result).toContain('0,00')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('rejects invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(validateEmail('')).toBe(false)
    })
  })
}) 