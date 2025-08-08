import { z } from 'zod'

// Schema base para IDs
export const idSchema = z.string().uuid('ID deve ser um UUID válido')

// Schema para email
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório')

// Schema para telefone brasileiro
export const phoneSchema = z
  .string()
  .regex(/^\+55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato brasileiro (+55 XX XXXXX-XXXX)')
  .optional()

// Schema para URL
export const urlSchema = z
  .string()
  .url('URL inválida')
  .optional()
  .or(z.literal(''))

// Schema para slug
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
  .min(1, 'Slug é obrigatório')

// Schemas para Blog Posts
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  slug: slugSchema,
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
  excerpt: z
    .string()
    .min(1, 'Resumo é obrigatório')
    .max(500, 'Resumo deve ter no máximo 500 caracteres'),
  featured_image_url: urlSchema,
  published: z.boolean().default(false),
  published_at: z.string().datetime().optional().nullable(),
  meta_title: z
    .string()
    .max(60, 'Meta título deve ter no máximo 60 caracteres')
    .optional(),
  meta_description: z
    .string()
    .max(160, 'Meta descrição deve ter no máximo 160 caracteres')
    .optional(),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  tags: z
    .array(z.string().min(1, 'Tag não pode estar vazia'))
    .max(10, 'Máximo 10 tags permitidas')
    .default([])
})

// Schema para atualizar blog posts
export const updateBlogPostSchema = blogPostSchema.partial()

// Schemas para Usuários
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  email: emailSchema,
  role: z
    .enum(['user', 'admin'], {
      errorMap: () => ({ message: 'Role deve ser "user" ou "admin"' })
    })
    .default('user'),
  avatar_url: urlSchema,
  phone: phoneSchema
})

// Schema para atualizar perfis de usuários
export const updateUserProfileSchema = userProfileSchema.partial().extend({
  id: idSchema
})

// Schemas para Quartos da Pousada
export const pousadaRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do quarto é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: z
    .string()
    .min(1, 'Tipo do quarto é obrigatório')
    .max(50, 'Tipo deve ter no máximo 50 caracteres'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  max_guests: z
    .number()
    .int('Número de hóspedes deve ser um número inteiro')
    .min(1, 'Deve acomodar pelo menos 1 hóspede')
    .max(10, 'Máximo 10 hóspedes por quarto'),
  size_sqm: z
    .number()
    .min(10, 'Área mínima deve ser 10m²')
    .max(500, 'Área máxima deve ser 500m²')
    .optional(),
  amenities: z
    .array(z.string().min(1, 'Comodidade não pode estar vazia'))
    .max(20, 'Máximo 20 comodidades por quarto')
    .default([]),
  image_url: urlSchema,
  available: z.boolean().default(true),
  price_per_night: z
    .number()
    .min(0, 'Preço não pode ser negativo')
    .max(10000, 'Preço máximo é R$ 10.000')
    .optional()
})

// Schema para atualizar quartos
export const updatePousadaRoomSchema = pousadaRoomSchema.partial().extend({
  id: idSchema
})

// Schemas para Produtos do Café
export const cafeProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do produto é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  price: z
    .number()
    .min(0.01, 'Preço mínimo é R$ 0,01')
    .max(1000, 'Preço máximo é R$ 1.000'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  image_url: urlSchema,
  available: z.boolean().default(true),
  preparation_time: z
    .number()
    .int('Tempo de preparo deve ser um número inteiro')
    .min(1, 'Tempo mínimo é 1 minuto')
    .max(120, 'Tempo máximo é 120 minutos')
    .optional(),
  ingredients: z
    .array(z.string().min(1, 'Ingrediente não pode estar vazio'))
    .max(20, 'Máximo 20 ingredientes')
    .default([]),
  allergens: z
    .array(z.string().min(1, 'Alérgeno não pode estar vazio'))
    .max(10, 'Máximo 10 alérgenos')
    .default([])
})

// Schema para atualizar produtos
export const updateCafeProductSchema = cafeProductSchema.partial().extend({
  id: idSchema
})

// Schemas para Configurações do Sistema
export const settingSchema = z.object({
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  key: z
    .string()
    .min(1, 'Chave é obrigatória')
    .max(100, 'Chave deve ter no máximo 100 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Chave deve conter apenas letras minúsculas, números e underscore'),
  value: z.any(), // Pode ser string, number, boolean, object
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
})

// Schema para múltiplas configurações
export const settingsUpdateSchema = z.record(
  z.string(), // category
  z.record(
    z.string(), // key
    z.object({
      value: z.any(),
      description: z.string().optional()
    })
  )
)

// Schemas para Filtros e Paginação
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val) : 1)
    .pipe(z.number().int().min(1, 'Página deve ser maior que 0')),
  limit: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val) : 20)
    .pipe(z.number().int().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100')),
  search: z
    .string()
    .max(200, 'Busca deve ter no máximo 200 caracteres')
    .optional(),
  sort: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({ message: 'Ordenação deve ser "asc" ou "desc"' })
    })
    .default('desc')
    .optional(),
  sortBy: z
    .string()
    .max(50, 'Campo de ordenação inválido')
    .optional()
})

// Schema para logs de auditoria
export const auditLogSchema = z.object({
  action: z
    .string()
    .min(1, 'Ação é obrigatória')
    .max(50, 'Ação deve ter no máximo 50 caracteres'),
  resource_type: z
    .string()
    .min(1, 'Tipo de recurso é obrigatório')
    .max(50, 'Tipo de recurso deve ter no máximo 50 caracteres'),
  resource_id: z
    .string()
    .max(100, 'ID do recurso deve ter no máximo 100 caracteres')
    .optional(),
  details: z
    .record(z.any())
    .optional()
})

// Schema para filtros de logs
export const logFiltersSchema = paginationSchema.extend({
  action: z
    .string()
    .max(50, 'Filtro de ação inválido')
    .optional(),
  resource: z
    .string()
    .max(50, 'Filtro de recurso inválido')
    .optional(),
  dateFrom: z
    .string()
    .datetime('Data de início inválida')
    .optional(),
  dateTo: z
    .string()
    .datetime('Data de fim inválida')
    .optional()
})

// Schema para upload de imagens
export const imageUploadSchema = z.object({
  file: z.any(), // File object
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z
    .array(z.string())
    .default(['image/jpeg', 'image/png', 'image/webp']),
  folder: z
    .string()
    .regex(/^[a-z0-9_-]+$/, 'Pasta deve conter apenas letras minúsculas, números, underscore e hífen')
    .optional()
})

// Função utilitária para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      return { success: false, errors }
    }
    return { success: false, errors: ['Erro de validação desconhecido'] }
  }
}

// Função para sanitizar dados de entrada
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers como onclick=
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}