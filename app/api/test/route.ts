import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const endpoints = [
    `${baseUrl}/api/health`,
    `${baseUrl}/api/health/database`,
    `${baseUrl}/api/analytics`,
    `${baseUrl}/api/check-availability`,
    `${baseUrl}/api/send-email`,
    `${baseUrl}/api/cardapio-pdf`,
    `${baseUrl}/api/errors`
  ]

  const results = []

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { 
        method: 'GET',
        cache: 'no-cache'
      })
      
      results.push({
        endpoint,
        status: response.status,
        ok: response.ok,
        message: response.ok ? 'Funcionando' : 'Erro'
      })
    } catch (error) {
      results.push({
        endpoint,
        status: 500,
        ok: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    }
  }

  const allWorking = results.every(result => result.ok)

  return NextResponse.json({
    success: true,
    message: allWorking ? 'Todas as APIs estão funcionando!' : 'Algumas APIs apresentam problemas',
    timestamp: new Date().toISOString(),
    total: endpoints.length,
    working: results.filter(r => r.ok).length,
    results
  })
} 