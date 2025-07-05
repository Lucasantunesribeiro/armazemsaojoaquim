import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '../../../lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, reservationData } = body

    switch (type) {
      case 'configuration':
        // Retorna a configuração atual do email service
        const config = emailService.getConfiguration()
        return NextResponse.json(config)

      case 'sandbox-test':
        // Testa a detecção de modo sandbox
        const config2 = emailService.getConfiguration()
        return NextResponse.json({
          isSandboxMode: config2.isSandboxMode,
          destinationEmail: config2.actualDestinationEmail,
          explanation: config2.note
        })

      case 'admin-notification':
        // Testa o envio de notificação para admin
        if (!reservationData) {
          return NextResponse.json(
            { success: false, error: 'Dados da reserva são obrigatórios' },
            { status: 400 }
          )
        }

        const result = await emailService.sendAdminNotification(reservationData)
        return NextResponse.json(result)

      case 'test-configuration':
        // Testa a configuração geral
        const testResult = await emailService.testConfiguration()
        return NextResponse.json(testResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de teste não reconhecido' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Erro na API de teste de email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  }
}