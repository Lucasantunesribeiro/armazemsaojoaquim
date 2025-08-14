import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { cookies } from 'next/headers'

async function createAdminSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
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
            console.log('Erro ao definir cookies:', error)
          }
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storageKey: 'armazem-sao-joaquim-auth',
        debug: process.env.NODE_ENV === 'development'
      },
    }
  )
}

async function verifyAdminAccess(supabase: any) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
    return { error: 'Forbidden', status: 403 }
  }

  return { success: true }
}

// Criar tabela de configurações se não existir
async function ensureSettingsTable(supabase: any) {
  const { error } = await supabase.rpc('create_settings_table_if_not_exists')
  
  if (error) {
    console.log('Info: Tabela de configurações pode já existir ou será criada manualmente')
  }
}

export async function GET() {
  try {
    const supabase = await createAdminSupabaseClient()
    const authResult = await verifyAdminAccess(supabase)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await ensureSettingsTable(supabase)

    // Buscar todas as configurações (mock data por enquanto)
    const settings: any[] = []
    const error = null

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      // Retornar configurações padrão se a tabela não existir
      return NextResponse.json({
        settings: getDefaultSettings(),
        isDefault: true
      })
    }

    // Converter array em objeto agrupado por categoria
    const groupedSettings = settings?.reduce((acc: any, setting: any) => {
      const category = setting.category || 'general'
      if (!acc[category]) {
        acc[category] = {}
      }
      acc[category][setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at
      }
      return acc
    }, {}) || {}

    return NextResponse.json({
      settings: { ...getDefaultSettings(), ...groupedSettings },
      isDefault: false
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminSupabaseClient()
    const authResult = await verifyAdminAccess(supabase)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { category, key, value, description } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Chave e valor são obrigatórios' },
        { status: 400 }
      )
    }

    await ensureSettingsTable(supabase)

    // Inserir ou atualizar configuração (mock por enquanto)
    const data = { id: '1', key, value, category, description }
    const error = null

    if (error) {
      console.error('Erro ao salvar configuração:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar configuração' },
        { status: 500 }
      )
    }

    return NextResponse.json({ setting: data })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createAdminSupabaseClient()
    const authResult = await verifyAdminAccess(supabase)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { settings } = await request.json()

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Configurações inválidas' },
        { status: 400 }
      )
    }

    await ensureSettingsTable(supabase)

    const updatedSettings = []

    // Processar configurações por categoria
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings === 'object' && categorySettings !== null) {
        for (const [key, setting] of Object.entries(categorySettings as any)) {
          // Mock data por enquanto
          const data = { category, key, value: (setting as any).value }
          const error = null

          if (error) {
            console.error(`Erro ao salvar ${category}.${key}:`, error)
          } else {
            updatedSettings.push(data)
          }
        }
      }
    }

    return NextResponse.json({ 
      message: 'Configurações atualizadas com sucesso',
      updated: updatedSettings.length
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function getDefaultSettings() {
  return {
    general: {
      site_name: {
        value: 'Armazém São Joaquim',
        description: 'Nome do site'
      },
      site_description: {
        value: 'Pousada, café e experiências únicas no coração da natureza',
        description: 'Descrição do site'
      },
      contact_email: {
        value: 'contato@armazemsaojoaquim.com.br',
        description: 'Email principal para contato'
      },
      contact_phone: {
        value: '+55 21 94099-1666',
        description: 'Telefone principal para contato'
      },
      address: {
        value: 'Estrada Rural São Joaquim, 123',
        description: 'Endereço completo'
      }
    },
    email: {
      smtp_host: {
        value: '',
        description: 'Servidor SMTP'
      },
      smtp_port: {
        value: '587',
        description: 'Porta SMTP'
      },
      smtp_user: {
        value: '',
        description: 'Usuário SMTP'
      },
      smtp_from: {
        value: 'noreply@armazemsaojoaquim.com.br',
        description: 'Email remetente padrão'
      }
    },
    seo: {
      meta_title: {
        value: 'Armazém São Joaquim - Pousada e Café',
        description: 'Título padrão das páginas'
      },
      meta_description: {
        value: 'Desfrute de momentos únicos na nossa pousada e café no coração da natureza.',
        description: 'Descrição padrão das páginas'
      },
      og_image: {
        value: '/images/og-default.jpg',
        description: 'Imagem padrão para redes sociais'
      }
    },
    features: {
      blog_enabled: {
        value: true,
        description: 'Habilitar seção do blog'
      },
      newsletter_enabled: {
        value: true,
        description: 'Habilitar newsletter'
      },
      comments_enabled: {
        value: false,
        description: 'Habilitar comentários no blog'
      }
    }
  }
}