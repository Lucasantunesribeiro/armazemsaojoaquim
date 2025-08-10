import { 
  UserDataTransformer, 
  BlogPostDataTransformer,
  transformApiResponse,
  DataValidator,
  FallbackDataGenerator,
  formatDate,
  formatDateTime,
  getRoleBadgeColor,
  getStatusBadgeColor
} from '@/lib/data-transformers'

describe('Data Transformers', () => {
  describe('UserDataTransformer', () => {
    const transformer = new UserDataTransformer()

    it('should transform complete user data', () => {
      const input = {
        id: '123',
        email: 'user@example.com',
        full_name: 'John Doe',
        phone: '+1234567890',
        role: 'admin',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T10:00:00Z',
        last_sign_in_at: '2023-01-03T10:00:00Z',
        sign_in_count: 5,
        avatar_url: 'https://example.com/avatar.jpg'
      }

      const result = transformer.transform(input)

      expect(result).toEqual({
        id: '123',
        email: 'user@example.com',
        full_name: 'John Doe',
        phone: '+1234567890',
        role: 'admin',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T10:00:00Z',
        last_sign_in: '2023-01-03T10:00:00Z',
        sign_in_count: 5,
        avatar_url: 'https://example.com/avatar.jpg'
      })
    })

    it('should handle missing optional fields', () => {
      const input = {
        id: '456',
        email: 'minimal@example.com'
      }

      const result = transformer.transform(input)

      expect(result.id).toBe('456')
      expect(result.email).toBe('minimal@example.com')
      expect(result.full_name).toBe('')
      expect(result.role).toBe('user')
      expect(result.sign_in_count).toBe(0)
    })

    it('should validate user data correctly', () => {
      const validUser = { id: '123', email: 'valid@example.com' }
      const invalidUser1 = { email: 'no-id@example.com' }
      const invalidUser2 = { id: '123' } // no email

      expect(transformer.validate(validUser)).toBe(true)
      expect(transformer.validate(invalidUser1)).toBe(false)
      expect(transformer.validate(invalidUser2)).toBe(false)
    })
  })

  describe('BlogPostDataTransformer', () => {
    const transformer = new BlogPostDataTransformer()

    it('should transform complete blog post data', () => {
      const input = {
        id: '789',
        title: 'Test Blog Post',
        excerpt: 'This is a test excerpt',
        published: true,
        author_name: 'Jane Author',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T10:00:00Z',
        published_at: '2023-01-03T10:00:00Z',
        category: 'Technology',
        tags: ['tech', 'blog', 'test'],
        image_url: 'https://example.com/image.jpg',
        views: 100
      }

      const result = transformer.transform(input)

      expect(result).toEqual({
        id: '789',
        title: 'Test Blog Post',
        excerpt: 'This is a test excerpt',
        status: 'published',
        author: 'Jane Author',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T10:00:00Z',
        published_at: '2023-01-03T10:00:00Z',
        category: 'Technology',
        tags: ['tech', 'blog', 'test'],
        featured_image: 'https://example.com/image.jpg',
        views: 100
      })
    })

    it('should normalize status from boolean', () => {
      const publishedPost = { id: '1', title: 'Test', published: true }
      const draftPost = { id: '2', title: 'Test', published: false }

      expect(transformer.transform(publishedPost).status).toBe('published')
      expect(transformer.transform(draftPost).status).toBe('draft')
    })

    it('should normalize status from string', () => {
      const scheduledPost = { id: '1', title: 'Test', status: 'scheduled' }
      const invalidPost = { id: '2', title: 'Test', status: 'invalid' }

      expect(transformer.transform(scheduledPost).status).toBe('scheduled')
      expect(transformer.transform(invalidPost).status).toBe('draft')
    })

    it('should normalize tags from string', () => {
      const stringTags = { id: '1', title: 'Test', tags: 'tag1, tag2, tag3' }
      const arrayTags = { id: '2', title: 'Test', tags: ['tag1', 'tag2'] }
      const noTags = { id: '3', title: 'Test' }

      expect(transformer.transform(stringTags).tags).toEqual(['tag1', 'tag2', 'tag3'])
      expect(transformer.transform(arrayTags).tags).toEqual(['tag1', 'tag2'])
      expect(transformer.transform(noTags).tags).toEqual([])
    })
  })

  describe('transformApiResponse', () => {
    const userTransformer = new UserDataTransformer()

    it('should handle array response', () => {
      const response = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' }
      ]

      const result = transformApiResponse(response, userTransformer)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })

    it('should handle nested data response', () => {
      const response = {
        data: [
          { id: '1', email: 'user1@example.com' },
          { id: '2', email: 'user2@example.com' }
        ]
      }

      const result = transformApiResponse(response, userTransformer)

      expect(result).toHaveLength(2)
    })

    it('should handle users property response', () => {
      const response = {
        users: [
          { id: '1', email: 'user1@example.com' }
        ]
      }

      const result = transformApiResponse(response, userTransformer)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter invalid items', () => {
      const response = [
        { id: '1', email: 'valid@example.com' },
        { email: 'invalid-no-id@example.com' }, // invalid - no id
        { id: '2', email: 'valid2@example.com' }
      ]

      const result = transformApiResponse(response, userTransformer)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })
  })

  describe('DataValidator', () => {
    it('should validate email addresses', () => {
      expect(DataValidator.isValidEmail('valid@example.com')).toBe(true)
      expect(DataValidator.isValidEmail('user+tag@domain.co.uk')).toBe(true)
      expect(DataValidator.isValidEmail('invalid-email')).toBe(false)
      expect(DataValidator.isValidEmail('no-at-sign.com')).toBe(false)
      expect(DataValidator.isValidEmail('')).toBe(false)
    })

    it('should validate dates', () => {
      expect(DataValidator.isValidDate('2023-01-01T10:00:00Z')).toBe(true)
      expect(DataValidator.isValidDate('2023-01-01')).toBe(true)
      expect(DataValidator.isValidDate('invalid-date')).toBe(false)
      expect(DataValidator.isValidDate('')).toBe(false)
    })

    it('should validate URLs', () => {
      expect(DataValidator.isValidUrl('https://example.com')).toBe(true)
      expect(DataValidator.isValidUrl('http://localhost:3000')).toBe(true)
      expect(DataValidator.isValidUrl('ftp://files.example.com')).toBe(true)
      expect(DataValidator.isValidUrl('not-a-url')).toBe(false)
      expect(DataValidator.isValidUrl('')).toBe(false)
    })

    it('should sanitize strings', () => {
      expect(DataValidator.sanitizeString('  normal text  ')).toBe('normal text')
      expect(DataValidator.sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(DataValidator.sanitizeString('text with > and < symbols')).toBe('text with  and  symbols')
    })

    it('should validate user data comprehensively', () => {
      const validUser = {
        id: '123',
        email: 'valid@example.com',
        created_at: '2023-01-01T10:00:00Z'
      }

      const invalidUser = {
        email: 'invalid-email',
        created_at: 'invalid-date'
      }

      const validResult = DataValidator.validateUserData(validUser)
      const invalidResult = DataValidator.validateUserData(invalidUser)

      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toContain('ID é obrigatório')
      expect(invalidResult.errors).toContain('Email inválido')
      expect(invalidResult.errors).toContain('Data de criação inválida')
    })
  })

  describe('FallbackDataGenerator', () => {
    it('should generate mock users', () => {
      const mockUsers = FallbackDataGenerator.generateMockUsers(3)

      expect(mockUsers).toHaveLength(3)
      expect(mockUsers[0].role).toBe('admin') // First user is admin
      expect(mockUsers[1].role).toBe('user')
      expect(mockUsers[2].role).toBe('user')

      mockUsers.forEach(user => {
        expect(user.id).toMatch(/^mock-user-\d+$/)
        expect(user.email).toMatch(/^usuario\d+@exemplo\.com$/)
        expect(DataValidator.isValidEmail(user.email)).toBe(true)
        expect(DataValidator.isValidDate(user.created_at)).toBe(true)
      })
    })

    it('should generate mock blog posts', () => {
      const mockPosts = FallbackDataGenerator.generateMockBlogPosts(2)

      expect(mockPosts).toHaveLength(2)

      mockPosts.forEach(post => {
        expect(post.id).toMatch(/^mock-post-\d+$/)
        expect(post.title).toMatch(/^Post de Exemplo \d+$/)
        expect(['draft', 'published', 'scheduled']).toContain(post.status)
        expect(post.author).toBe('Admin')
        expect(Array.isArray(post.tags)).toBe(true)
        expect(post.tags.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Utility Functions', () => {
    it('should format dates correctly', () => {
      const date = '2023-01-15T14:30:00Z'
      
      expect(formatDate(date)).toBe('15/01/2023')
      expect(formatDateTime(date)).toMatch(/15\/01\/2023 \d{2}:\d{2}/)
    })

    it('should handle invalid dates', () => {
      expect(formatDate('')).toBe('N/A')
      expect(formatDate('invalid-date')).toBe('Data inválida')
    })

    it('should return correct role badge colors', () => {
      expect(getRoleBadgeColor('admin')).toContain('red')
      expect(getRoleBadgeColor('user')).toContain('blue')
      expect(getRoleBadgeColor('unknown')).toContain('gray')
    })

    it('should return correct status badge colors', () => {
      expect(getStatusBadgeColor('published')).toContain('green')
      expect(getStatusBadgeColor('draft')).toContain('gray')
      expect(getStatusBadgeColor('scheduled')).toContain('blue')
    })
  })
})