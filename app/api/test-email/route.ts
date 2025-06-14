import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '../../../lib/email-service'

export async function GET() {
  try {
    // Testar configuração do email
    const configTest = await emailService.testConfiguration()
    
    if (!configTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Configuração de email inválida',
        details: configTest.error,
        configured: emailService.isConfigured()
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sistema de email configurado e funcionando',
      configured: emailService.isConfigured(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao testar sistema de email',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      configured: emailService.isConfigured()
    }, { status: 500 })
  }
}