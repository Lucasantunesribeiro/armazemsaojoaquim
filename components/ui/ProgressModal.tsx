'use client'

import React from 'react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

const ProgressModal: React.FC = () => {
  const { progressState } = useNotifications()

  if (!progressState?.visible) return null

  const getProgressIcon = () => {
    if (progressState.progress >= 100) {
      return <CheckCircle className="h-8 w-8 text-green-500" />
    }
    
    if (progressState.stage === 'error') {
      return <AlertCircle className="h-8 w-8 text-red-500" />
    }
    
    return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
  }

  const getProgressColor = () => {
    if (progressState.progress >= 100) return 'bg-green-500'
    if (progressState.stage === 'error') return 'bg-red-500'
    return 'bg-blue-500'
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-modal-backdrop-enter" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-modal-content-enter">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              {getProgressIcon()}
            </div>
          </div>
          
          {/* Stage Title */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            {progressState.stage === 'creating' && '🔧 Criando sua conta...'}
            {progressState.stage === 'sending' && '📧 Enviando email...'}
            {progressState.stage === 'confirming' && '✅ Finalizando cadastro...'}
            {progressState.stage === 'completed' && '🎉 Concluído!'}
            {progressState.stage === 'error' && '❌ Ops! Algo deu errado'}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            {progressState.message}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Progresso</span>
              <span>{Math.round(progressState.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                style={{ width: `${Math.min(100, Math.max(0, progressState.progress))}%` }}
              />
            </div>
          </div>
          
          {/* Steps Indicator */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className={`flex items-center space-x-2 ${
              ['creating', 'sending', 'confirming', 'completed'].includes(progressState.stage) 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ['creating', 'sending', 'confirming', 'completed'].includes(progressState.stage)
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span>Criando</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${
              ['sending', 'confirming', 'completed'].includes(progressState.stage) 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ['sending', 'confirming', 'completed'].includes(progressState.stage)
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span>Enviando</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${
              ['confirming', 'completed'].includes(progressState.stage) 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ['confirming', 'completed'].includes(progressState.stage)
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span>Finalizando</span>
            </div>
          </div>
          
          {/* Completion Message */}
          {progressState.progress >= 100 && progressState.stage === 'completed' && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Conta criada com sucesso!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                    Verifique seu email para ativar sua conta.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {progressState.stage === 'error' && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Falha na operação
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    Tente novamente ou contate o suporte.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProgressModal 