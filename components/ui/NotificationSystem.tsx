'use client'

import React from 'react'
import { ToastContainer } from './Toast'
import ProgressModal from './ProgressModal'

/**
 * Sistema completo de notificações
 * Integra todos os componentes de notificação em um único sistema
 * - Toast messages para feedback instantâneo
 * - Modal de welcome para novos usuários
 * - Modal de progress para operações longas
 */
export const NotificationSystem: React.FC = () => {
  return (
    <>
      {/* Toast notifications */}
      <ToastContainer />
      
      {/* Welcome modal for new users */}
      {/* <WelcomeModal /> */}
      
      {/* Progress modal for long operations */}
      <ProgressModal />
    </>
  )
}

export default NotificationSystem 