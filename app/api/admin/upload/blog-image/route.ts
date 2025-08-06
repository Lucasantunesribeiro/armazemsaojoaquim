import { createServerClient } from '@/lib/supabase'
// import { cookies } from 'next/headers' // Não necessário mais
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API UPLOAD: Iniciando upload de imagem')
    
    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const supabase = await createServerClient()
    
    // Verificar usuário admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Verificação por email como fallback principal (mais confiável)
    const isAdminByEmail = user.email === 'armazemsaojoaquimoficial@gmail.com'
    
    if (!isAdminByEmail) {
      // Tentar verificação por role no banco
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (roleError || userData?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
    }

    // Processar upload
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    console.log('📁 API UPLOAD: Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    
    // Caminho completo para salvar
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'blog')
    const filePath = path.join(uploadDir, fileName)
    
    // Criar diretório se não existir
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.log('📁 API UPLOAD: Diretório já existe ou erro ao criar:', error)
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    console.log('✅ API UPLOAD: Arquivo salvo em:', filePath)

    // Retornar path para uso no frontend
    const publicPath = `/images/blog/${fileName}`
    
    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName: fileName,
      originalName: file.name,
      size: file.size
    })

  } catch (error: any) {
    console.error('❌ API UPLOAD: Erro interno:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}