import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Caminho para o arquivo PDF
    const pdfPath = join(process.cwd(), 'public', 'images', 'Cardapio.pdf')
    
    // Verificar se o arquivo existe
    if (!existsSync(pdfPath)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'PDF do cardápio não encontrado',
          message: 'O arquivo do cardápio não está disponível no momento. Entre em contato conosco pelo WhatsApp para receber o cardápio completo.'
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Ler o arquivo PDF
    const pdfBuffer = readFileSync(pdfPath)
    
    // Retornar o PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cardapio-armazem-sao-joaquim.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    })
  } catch (error) {
    console.error('Erro ao servir PDF:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar a solicitação do PDF. Tente novamente mais tarde.'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}

// Para implementação futura com PDF real:
/*
export async function GET(request: NextRequest) {
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Caminho para o arquivo PDF
    const pdfPath = path.join(process.cwd(), 'public', 'cardapio-armazem-sao-joaquim.pdf')
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(pdfPath)) {
      return new NextResponse(
        JSON.stringify({ error: 'PDF não encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Ler o arquivo PDF
    const pdfBuffer = fs.readFileSync(pdfPath)
    
    // Retornar o PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cardapio-armazem-sao-joaquim.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Erro ao servir PDF:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
*/ 