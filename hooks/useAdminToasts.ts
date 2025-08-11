'use client'

import { useToastNotifications } from './useToastNotifications'

export function useAdminToasts() {
  const { showSuccess, showError, showWarning, showInfo } = useToastNotifications()

  const showSaveSuccess = (itemType: string = 'item') => {
    return showSuccess(
      `${itemType} salvo com sucesso!`,
      '✅ Salvo!',
      { duration: 3000 }
    )
  }

  const showSaveError = (itemType: string = 'item') => {
    return showError(
      `Erro ao salvar ${itemType}. Tente novamente.`,
      '❌ Erro ao salvar',
      { duration: 5000 }
    )
  }

  const showDeleteSuccess = (itemType: string = 'item') => {
    return showSuccess(
      `${itemType} excluído com sucesso!`,
      '🗑️ Excluído!',
      { duration: 3000 }
    )
  }

  const showDeleteError = (itemType: string = 'item') => {
    return showError(
      `Erro ao excluir ${itemType}. Tente novamente.`,
      '❌ Erro ao excluir',
      { duration: 5000 }
    )
  }

  const showCreateSuccess = (itemType: string = 'item') => {
    return showSuccess(
      `${itemType} criado com sucesso!`,
      '🎉 Criado!',
      { duration: 3000 }
    )
  }

  const showCreateError = (itemType: string = 'item', errorMessage?: string) => {
    return showError(
      errorMessage || `Erro ao criar ${itemType}. Tente novamente.`,
      '❌ Erro ao criar',
      { duration: 5000 }
    )
  }

  const showUpdateSuccess = (itemType: string = 'item') => {
    return showSuccess(
      `${itemType} atualizado com sucesso!`,
      '📝 Atualizado!',
      { duration: 3000 }
    )
  }

  const showUpdateError = (itemType: string = 'item', errorMessage?: string) => {
    return showError(
      errorMessage || `Erro ao atualizar ${itemType}. Tente novamente.`,
      '❌ Erro ao atualizar',
      { duration: 5000 }
    )
  }

  const showUploadSuccess = () => {
    return showSuccess(
      'Upload realizado com sucesso!',
      '📤 Upload concluído!',
      { duration: 3000 }
    )
  }

  const showUploadError = (message?: string) => {
    return showError(
      message || 'Erro ao fazer upload. Tente novamente.',
      '❌ Erro no upload',
      { duration: 5000 }
    )
  }

  const showValidationError = (message: string) => {
    return showWarning(
      message,
      '⚠️ Dados inválidos',
      { duration: 4000 }
    )
  }

  const showCopySuccess = () => {
    return showSuccess(
      'Copiado para a área de transferência!',
      '📋 Copiado!',
      { duration: 2000 }
    )
  }

  const showNetworkError = () => {
    return showError(
      'Erro de conexão. Verifique sua internet.',
      '🌐 Erro de rede',
      { duration: 6000 }
    )
  }

  return {
    showSaveSuccess,
    showSaveError,
    showDeleteSuccess,
    showDeleteError,
    showCreateSuccess,
    showCreateError,
    showUpdateSuccess,
    showUpdateError,
    showUploadSuccess,
    showUploadError,
    showValidationError,
    showCopySuccess,
    showNetworkError
  }
}

export default useAdminToasts