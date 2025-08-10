'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { useToastNotifications } from '@/hooks/useToastNotifications'

export default function ToastTest() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAuthSuccess,
    showAuthError,
    showNetworkError,
    showValidationError,
    showLocationSuccess,
    showLocationError,
    clearToasts
  } = useToastNotifications()

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Toast Notification Test</h1>
      
      {/* Basic Toast Types */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Toast Types</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => showSuccess('Operação realizada com sucesso!', 'Sucesso')}
            className="bg-green-600 hover:bg-green-700"
          >
            Success Toast
          </Button>
          
          <Button
            onClick={() => showError('Algo deu errado. Tente novamente.', 'Erro')}
            variant="destructive"
          >
            Error Toast
          </Button>
          
          <Button
            onClick={() => showWarning('Atenção: Verifique os dados inseridos.', 'Aviso')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Warning Toast
          </Button>
          
          <Button
            onClick={() => showInfo('Esta é uma informação importante.', 'Informação')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Info Toast
          </Button>
        </div>
      </div>

      {/* Authentication Toasts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Authentication Toasts</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => showAuthSuccess('Login realizado com sucesso!')}
            className="bg-green-600 hover:bg-green-700"
          >
            Auth Success
          </Button>
          
          <Button
            onClick={() => showAuthError('Email ou senha incorretos.')}
            variant="destructive"
          >
            Auth Error
          </Button>
        </div>
      </div>

      {/* Specialized Toasts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Specialized Toasts</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => showNetworkError()}
            variant="outline"
          >
            Network Error
          </Button>
          
          <Button
            onClick={() => showValidationError('Por favor, preencha todos os campos obrigatórios.')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Validation Error
          </Button>
          
          <Button
            onClick={() => showLocationSuccess()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Location Success
          </Button>
          
          <Button
            onClick={() => showLocationError()}
            variant="outline"
          >
            Location Error
          </Button>
        </div>
      </div>

      {/* Toast with Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Toasts with Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => showError('Falha ao salvar dados.', 'Erro', {
              action: {
                label: 'Tentar Novamente',
                onClick: () => showSuccess('Tentando novamente...')
              }
            })}
            variant="destructive"
          >
            Error with Action
          </Button>
          
          <Button
            onClick={() => showInfo('Arquivo enviado para processamento.', 'Upload', {
              duration: 0, // Don't auto-dismiss
              action: {
                label: 'Ver Status',
                onClick: () => showInfo('Status: Processando...')
              }
            })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Persistent Toast
          </Button>
        </div>
      </div>

      {/* Control Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Control Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => clearToasts()}
            variant="outline"
          >
            Clear All Toasts
          </Button>
          
          <Button
            onClick={() => {
              // Show multiple toasts to test stacking
              showSuccess('Toast 1')
              setTimeout(() => showInfo('Toast 2'), 200)
              setTimeout(() => showWarning('Toast 3'), 400)
              setTimeout(() => showError('Toast 4'), 600)
            }}
            variant="secondary"
          >
            Show Multiple Toasts
          </Button>
        </div>
      </div>

      {/* Interactive Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Interactive Features</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => showError('Erro detalhado do sistema', 'Erro', {
              expandable: {
                summary: 'Ver detalhes técnicos',
                details: 'Stack trace: Error at line 42\nFunction: processData()\nModule: dataProcessor.js\nTimestamp: 2024-01-08 15:30:45'
              },
              action: {
                label: 'Reportar Bug',
                onClick: () => showSuccess('Bug reportado com sucesso!')
              }
            })}
            variant="destructive"
          >
            Expandable Error
          </Button>
          
          <Button
            onClick={() => {
              let progress = 0
              const toastId = showInfo('Processando arquivo...', 'Upload', {
                duration: 0,
                dismissible: false,
                progress: {
                  current: 0,
                  total: 100,
                  label: 'Upload'
                }
              })
              
              const interval = setInterval(() => {
                progress += 10
                // Note: In a real implementation, you'd update the existing toast
                if (progress >= 100) {
                  clearInterval(interval)
                  setTimeout(() => {
                    showSuccess('Upload concluído!', 'Sucesso')
                  }, 500)
                }
              }, 300)
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Progress Toast
          </Button>
          
          <Button
            onClick={() => showInfo('Informação importante que pode ser copiada', 'Info', {
              copyable: {
                text: 'Esta é a informação copiável: ID-12345-ABCDE',
                label: 'Copiar ID'
              }
            })}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Copyable Toast
          </Button>
          
          <Button
            onClick={() => showWarning('Esta é uma mensagem importante que requer ação', 'Atenção', {
              duration: 0,
              action: {
                label: 'Confirmar',
                onClick: () => showSuccess('Ação confirmada!')
              },
              secondaryAction: {
                label: 'Cancelar',
                onClick: () => showInfo('Ação cancelada')
              }
            })}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Action Buttons
          </Button>
        </div>
      </div>

      {/* Dark Mode Test */}
      <div className="bg-gray-900 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-white">Dark Background Test</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => showSuccess('Success in dark mode!')}
            className="bg-green-600 hover:bg-green-700"
          >
            Dark Success
          </Button>
          
          <Button
            onClick={() => showError('Error in dark mode!')}
            variant="destructive"
          >
            Dark Error
          </Button>
        </div>
      </div>
    </div>
  )
}