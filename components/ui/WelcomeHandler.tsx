'use client'

import { useEffect } from 'react'
import { useWelcomeMessage } from '@/components/providers/NotificationProvider'

export const WelcomeHandler: React.FC = () => {
  const { checkAndShowWelcome } = useWelcomeMessage()

  useEffect(() => {
    // Aguardar um pouco para não interferir com o carregamento da página
    const timer = setTimeout(() => {
      checkAndShowWelcome()
    }, 2000)

    return () => clearTimeout(timer)
  }, [checkAndShowWelcome])

  // Este componente não renderiza nada visualmente
  return null
}

export default WelcomeHandler 