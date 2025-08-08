import { describe, it, expect } from '@jest/globals'
import { 
  blogPostSchema,
  userProfileSchema,
  pousadaRoomSchema,
  cafeProductSchema,
  validateData,
  sanitizeInput
} from '@/lib/validation-schemas'

describe('Validation Schemas', () => {
  describe('blogPostSchema', () => {
    it('should validate a valid blog post', () => {
      const validPost = {
        title: 'Meu Post de Teste',
        slug: 'meu-post-de-teste',
        content: 'Este é o conteúdo do meu post de teste com pelo menos 50 caracteres para passar na validação.',
        excerpt: 'Este é um resumo do post',
        category: 'tecnologia',
        published: false
      }

      const result = validateData(blogPostSchema, validPost)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should fail validation with invalid slug', () => {
      const invalidPost = {
        title: 'Meu Post',
        slug: 'Meu Post Com Espaços', // slug inválido
        content: 'Conteúdo válido com mais de 50 caracteres para passar na validação mínima.',
        excerpt: 'Resumo válido',
        category: 'tecnologia'
      }

      const result = validateData(blogPostSchema, invalidPost)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('slug: Slug deve conter apenas letras minúsculas, números e hífens')
    })

    it('should fail validation with short content', () => {
      const invalidPost = {
        title: 'Meu Post',
        slug: 'meu-post',
        content: 'Muito curto', // menos de 50 caracteres
        excerpt: 'Resumo válido',
        category: 'tecnologia'
      }

      const result = validateData(blogPostSchema, invalidPost)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('pelo menos 50 caracteres'))).toBe(true)
    })

    it('should fail validation with too many tags', () => {
      const invalidPost = {
        title: 'Meu Post',
        slug: 'meu-post',
        content: 'Conteúdo válido com mais de 50 caracteres para passar na validação.',
        excerpt: 'Resumo válido',
        category: 'tecnologia',
        tags: Array(11).fill('tag') // mais de 10 tags
      }

      const result = validateData(blogPostSchema, invalidPost)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('Máximo 10 tags'))).toBe(true)
    })
  })

  describe('userProfileSchema', () => {
    it('should validate a valid user profile', () => {
      const validProfile = {
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'user',
        phone: '+55 11 99999-9999'
      }

      const result = validateData(userProfileSchema, validProfile)
      expect(result.success).toBe(true)
      expect(result.data?.role).toBe('user')
    })

    it('should fail validation with invalid email', () => {
      const invalidProfile = {
        name: 'João Silva',
        email: 'email-invalido',
        role: 'user'
      }

      const result = validateData(userProfileSchema, invalidProfile)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('Email inválido'))).toBe(true)
    })

    it('should fail validation with invalid role', () => {
      const invalidProfile = {
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'super-admin' // role inválida
      }

      const result = validateData(userProfileSchema, invalidProfile)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('Role deve ser'))).toBe(true)
    })

    it('should fail validation with invalid phone', () => {
      const invalidProfile = {
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'user',
        phone: '123456789' // formato inválido
      }

      const result = validateData(userProfileSchema, invalidProfile)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('formato brasileiro'))).toBe(true)
    })
  })

  describe('pousadaRoomSchema', () => {
    it('should validate a valid pousada room', () => {
      const validRoom = {
        name: 'Quarto Deluxe',
        type: 'suite',
        description: 'Um quarto espaçoso e confortável com vista para o jardim.',
        max_guests: 2,
        size_sqm: 25,
        amenities: ['ar-condicionado', 'tv', 'frigobar'],
        available: true
      }

      const result = validateData(pousadaRoomSchema, validRoom)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should fail validation with invalid guest count', () => {
      const invalidRoom = {
        name: 'Quarto Test',
        type: 'single',
        description: 'Descrição válida com mais de 20 caracteres.',
        max_guests: 0, // inválido
        available: true
      }

      const result = validateData(pousadaRoomSchema, invalidRoom)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('pelo menos 1 hóspede'))).toBe(true)
    })

    it('should fail validation with short description', () => {
      const invalidRoom = {
        name: 'Quarto Test',
        type: 'single',
        description: 'Muito curto', // menos de 20 caracteres
        max_guests: 2,
        available: true
      }

      const result = validateData(pousadaRoomSchema, invalidRoom)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('pelo menos 20 caracteres'))).toBe(true)
    })
  })

  describe('cafeProductSchema', () => {
    it('should validate a valid cafe product', () => {
      const validProduct = {
        name: 'Cappuccino',
        description: 'Delicioso cappuccino com leite vaporizado e canela.',
        price: 8.50,
        category: 'bebidas-quentes',
        available: true,
        preparation_time: 5,
        ingredients: ['café espresso', 'leite', 'canela']
      }

      const result = validateData(cafeProductSchema, validProduct)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should fail validation with negative price', () => {
      const invalidProduct = {
        name: 'Produto Test',
        description: 'Descrição válida do produto.',
        price: -5, // preço negativo
        category: 'test'
      }

      const result = validateData(cafeProductSchema, invalidProduct)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('Preço mínimo'))).toBe(true)
    })

    it('should fail validation with excessive preparation time', () => {
      const invalidProduct = {
        name: 'Produto Test',
        description: 'Descrição válida do produto.',
        price: 10,
        category: 'test',
        preparation_time: 150 // mais de 120 minutos
      }

      const result = validateData(cafeProductSchema, invalidProduct)
      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('Tempo máximo é 120'))).toBe(true)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous characters from strings', () => {
      const dangerousInput = '<script>alert("xss")</script>Hello<>'
      const sanitized = sanitizeInput(dangerousInput)
      expect(sanitized).toBe('alert("xss")Hello')
    })

    it('should remove javascript: protocol', () => {
      const dangerousInput = 'javascript:alert("xss")'
      const sanitized = sanitizeInput(dangerousInput)
      expect(sanitized).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      const dangerousInput = 'onclick=alert("xss") text'
      const sanitized = sanitizeInput(dangerousInput)
      expect(sanitized).toBe(' text')
    })

    it('should sanitize nested objects', () => {
      const dangerousObject = {
        title: '<script>alert("xss")</script>Title',
        content: {
          body: 'onclick=evil() content',
          meta: ['<div>tag</div>', 'javascript:void(0)']
        }
      }

      const sanitized = sanitizeInput(dangerousObject)
      expect(sanitized.title).toBe('alert("xss")Title')
      expect(sanitized.content.body).toBe(' content')
      expect(sanitized.content.meta[0]).toBe('tag')
      expect(sanitized.content.meta[1]).toBe('void(0)')
    })

    it('should handle arrays correctly', () => {
      const dangerousArray = [
        '<script>alert("xss")</script>',
        'javascript:alert("test")',
        'onclick=evil()'
      ]

      const sanitized = sanitizeInput(dangerousArray)
      expect(sanitized[0]).toBe('alert("xss")')
      expect(sanitized[1]).toBe('alert("test")')
      expect(sanitized[2]).toBe('')
    })

    it('should preserve non-string values', () => {
      const input = {
        text: '<script>alert("xss")</script>',
        number: 123,
        boolean: true,
        null_value: null,
        undefined_value: undefined
      }

      const sanitized = sanitizeInput(input)
      expect(sanitized.text).toBe('alert("xss")')
      expect(sanitized.number).toBe(123)
      expect(sanitized.boolean).toBe(true)
      expect(sanitized.null_value).toBe(null)
      expect(sanitized.undefined_value).toBe(undefined)
    })
  })
})