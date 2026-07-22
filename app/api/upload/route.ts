import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { withAdminAuth } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const BUCKET_NAME = 'menu-images'

export async function POST(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📤 [UPLOAD] Iniciando upload de imagem...')

      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        console.error('❌ [UPLOAD] Nenhum arquivo enviado')
        return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
      }

      console.log(`📁 [UPLOAD] Arquivo: ${file.name}, Tipo: ${file.type}, Tamanho: ${file.size} bytes`)

      // Validar tipo de arquivo
      if (!ALLOWED_TYPES.includes(file.type)) {
        console.error(`❌ [UPLOAD] Tipo não permitido: ${file.type}`)
        return NextResponse.json(
          { error: 'Tipo de arquivo não permitido. Use jpg, jpeg, png ou webp' },
          { status: 400 }
        )
      }

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        console.error(`❌ [UPLOAD] Arquivo muito grande: ${file.size} bytes`)
        return NextResponse.json(
          { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
          { status: 400 }
        )
      }

      // Converter para buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log('🔄 [UPLOAD] Comprimindo imagem...')
      // Comprimir imagem com sharp
      const compressedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer()

      console.log(`✅ [UPLOAD] Imagem comprimida: ${compressedBuffer.length} bytes`)

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const fileName = `${timestamp}-${randomStr}.webp`

      console.log(`📤 [UPLOAD] Fazendo upload para Supabase Storage: ${fileName}`)
      // Upload para Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, compressedBuffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ [UPLOAD] Erro no upload:', error)
        return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)

      console.log(`✅ [UPLOAD] Upload concluído: ${publicUrl}`)
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: fileName
      })

    } catch (error) {
      console.error('💥 [UPLOAD] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno no servidor' },
        { status: 500 }
      )
    }
  }, request)
}

export async function DELETE(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      const { searchParams } = new URL(request.url)
      const fileName = searchParams.get('fileName')

      if (!fileName) {
        console.error('❌ [UPLOAD-DELETE] Nome do arquivo não fornecido')
        return NextResponse.json({ error: 'Nome do arquivo não fornecido' }, { status: 400 })
      }

      console.log(`🗑️ [UPLOAD-DELETE] Deletando arquivo: ${fileName}`)

      const { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([fileName])

      if (error) {
        console.error('❌ [UPLOAD-DELETE] Erro ao deletar:', error)
        return NextResponse.json({ error: 'Erro ao deletar imagem' }, { status: 500 })
      }

      console.log(`✅ [UPLOAD-DELETE] Arquivo deletado com sucesso`)
      return NextResponse.json({ success: true })

    } catch (error) {
      console.error('💥 [UPLOAD-DELETE] Erro interno:', error)
      return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
    }
  }, request)
}
