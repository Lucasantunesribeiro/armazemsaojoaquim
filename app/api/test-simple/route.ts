import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString() 
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST recebido!', 
      data: body,
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao processar POST',
      timestamp: new Date().toISOString() 
    }, { status: 400 })
  }
} 