'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  showProgress?: boolean
  timeout?: number
  onTimeout?: () => void
  onCancel?: () => void
  showCancelButton?: boolean
  estimatedTime?: number
  className?: string
}

export function LoadingState({
  message = 'Carregando...',
  showProgress = false,
  timeout = 15000, // 15 seconds default
  onTimeout,
  onCancel,
  showCancelButton = false,
  estimatedTime,
  className = ''
}: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    
    const interval = setInterval(() => {
      const currentElapsed = Date.now() - startTime
      setElapsed(currentElapsed)
      
      // Show warning at 70% of timeout
      if (currentElapsed > timeout * 0.7 && !showWarning) {
        setShowWarning(true)
      }
      
      // Handle timeout
      if (currentElapsed >= timeout && !timedOut) {
        setTimedOut(true)
        if (onTimeout) {
          onTimeout()
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [timeout, onTimeout, showWarning, timedOut])

  const progressPercentage = estimatedTime 
    ? Math.min((elapsed / estimatedTime) * 100, 95) // Never show 100% until actually done
    : Math.min((elapsed / timeout) * 100, 95)

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  if (timedOut) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Operação Demorou Mais que o Esperado
        </h3>
        <p className="text-gray-600 mb-4">
          A operação está demorando mais que o usual. Isso pode indicar um problema temporário.
        </p>
        <div className="space-y-2">
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          <p className="text-xs text-gray-500">
            Tempo decorrido: {formatTime(elapsed)}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 text-center ${className}`}>
      <div className="mb-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {message}
        </h3>
        
        {showWarning && (
          <div className="flex items-center justify-center text-amber-600 mb-2">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Operação está demorando mais que o esperado...</span>
          </div>
        )}
        
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        
        <div className="text-sm text-gray-500 space-y-1">
          <p>Tempo decorrido: {formatTime(elapsed)}</p>
          {estimatedTime && (
            <p>Tempo estimado: {formatTime(estimatedTime)}</p>
          )}
        </div>
      </div>
      
      {showCancelButton && onCancel && (
        <Button 
          onClick={onCancel} 
          variant="outline" 
          size="sm"
          className="mt-2"
        >
          Cancelar
        </Button>
      )}
    </Card>
  )
}

// Skeleton loading components for different content types
export function UserListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function BlogPostListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="flex space-x-2">
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// Hook for managing loading states with timeout
export function useLoadingState(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startLoading = () => {
    setLoading(true)
    setError(null)
    setStartTime(Date.now())
  }

  const stopLoading = () => {
    setLoading(false)
    setStartTime(null)
  }

  const setLoadingError = (errorMessage: string) => {
    setError(errorMessage)
    setLoading(false)
    setStartTime(null)
  }

  const getElapsedTime = () => {
    return startTime ? Date.now() - startTime : 0
  }

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    getElapsedTime
  }
}