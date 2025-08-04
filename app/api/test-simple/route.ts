import { NextRequest, NextResponse } from 'next/server'

// Função para criar resposta JSON padronizada
function createJsonResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return createJsonResponse({ message: 'CORS preflight successful' }, 200)
}

// GET - Teste simples
export async function GET(request: NextRequest) {
  try {
    return createJsonResponse({
      success: true,
      message: 'API funcionando corretamente!',
      timestamp: new Date().toISOString(),
      url: request.url,
      method: 'GET'
    })
  } catch (error) {
    console.error('Erro no GET test-simple:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
}

// POST - Teste simples
export async function POST(request: NextRequest) {
  try {
    let body = null
    try {
      body = await request.json()
    } catch (e) {
      // Se não conseguir parsear JSON, continua sem body
    }

    return createJsonResponse({
      success: true,
      message: 'POST funcionando corretamente!',
      timestamp: new Date().toISOString(),
      url: request.url,
      method: 'POST',
      receivedBody: body
    }, 201)
  } catch (error) {
    console.error('Erro no POST test-simple:', error)
    return createJsonResponse({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
} 