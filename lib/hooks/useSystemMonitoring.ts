'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { errorTracker } from '../error-tracking'

interface SystemMetrics {
  performance: {
    loadTime: number
    renderTime: number
    memoryUsage?: number
    connectionSpeed?: string
  }
  errors: {
    total: number
    recent: number
    critical: number
    byType: Record<string, number>
  }
  health: {
    database: 'online' | 'offline' | 'checking'
    api: 'online' | 'offline' | 'checking'
    lastCheck: number
  }
  user: {
    sessionDuration: number
    pageViews: number
    interactions: number
  }
}

export function useSystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    performance: {
      loadTime: 0,
      renderTime: 0
    },
    errors: {
      total: 0,
      recent: 0,
      critical: 0,
      byType: {}
    },
    health: {
      database: 'checking',
      api: 'checking',
      lastCheck: 0
    },
    user: {
      sessionDuration: 0,
      pageViews: 0,
      interactions: 0
    }
  })

  const [isMonitoring, setIsMonitoring] = useState(false)
  const intervalsRef = useRef<{
    health?: NodeJS.Timeout
    error?: NodeJS.Timeout
    performance?: NodeJS.Timeout
    user?: NodeJS.Timeout
  }>({})
  const listenersRef = useRef<boolean>(false)

  // Verificar saúde do sistema
  const checkSystemHealth = useCallback(async () => {
    const startTime = performance.now()

    try {
      const response = await fetch('/api/health/database', {
        method: 'GET',
        cache: 'no-cache'
      })
      
      const data = await response.json()
      const loadTime = performance.now() - startTime

      setMetrics(prev => ({
        ...prev,
        health: {
          database: data.status === 'ok' ? 'online' : 'offline',
          api: response.ok ? 'online' : 'offline',
          lastCheck: Date.now()
        },
        performance: {
          ...prev.performance,
          loadTime
        }
      }))

      return { success: true, loadTime }
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        health: {
          database: 'offline',
          api: 'offline',
          lastCheck: Date.now()
        }
      }))

      return { success: false, error }
    }
  }, [])

  // Atualizar métricas de erro
  const updateErrorMetrics = useCallback(() => {
    const stats = errorTracker.getErrorStats()
    const criticalErrors = errorTracker.getErrorsBySeverity('critical').length

    setMetrics(prev => ({
      ...prev,
      errors: {
        total: stats.total,
        recent: stats.recent,
        critical: criticalErrors,
        byType: stats.byType
      }
    }))
  }, [])

  // Monitorar performance
  const updatePerformanceMetrics = useCallback(() => {
    // Tempo de renderização
    const renderStart = performance.now()
    
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart

      // Uso de memória (se disponível)
      let memoryUsage: number | undefined
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }

      // Velocidade de conexão (se disponível)
      let connectionSpeed: string | undefined
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connectionSpeed = connection.effectiveType
      }

      setMetrics(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          renderTime,
          memoryUsage,
          connectionSpeed
        }
      }))
    })
  }, [])

  // Monitorar atividade do usuário
  const updateUserMetrics = useCallback(() => {
    const sessionStart = parseInt(sessionStorage.getItem('sessionStart') || '0')
    const pageViews = parseInt(sessionStorage.getItem('pageViews') || '0')
    const interactions = parseInt(sessionStorage.getItem('interactions') || '0')

    const sessionDuration = sessionStart ? Date.now() - sessionStart : 0

    setMetrics(prev => ({
      ...prev,
      user: {
        sessionDuration,
        pageViews,
        interactions
      }
    }))
  }, [])

  // Função para limpar intervalos e listeners
  const cleanup = useCallback(() => {
    // Limpar intervalos
    Object.values(intervalsRef.current).forEach(interval => {
      if (interval) clearInterval(interval)
    })
    intervalsRef.current = {}

    // Remover listeners se existirem
    if (listenersRef.current) {
      const trackInteraction = () => {
        const current = parseInt(sessionStorage.getItem('interactions') || '0')
        sessionStorage.setItem('interactions', (current + 1).toString())
        updateUserMetrics()
      }

      document.removeEventListener('click', trackInteraction)
      document.removeEventListener('keydown', trackInteraction)
      document.removeEventListener('scroll', trackInteraction)
      listenersRef.current = false
    }

    setIsMonitoring(false)
  }, [updateUserMetrics])

  // Inicializar monitoramento
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return cleanup

    setIsMonitoring(true)

    // Configurar sessão do usuário
    if (!sessionStorage.getItem('sessionStart')) {
      sessionStorage.setItem('sessionStart', Date.now().toString())
    }

    // Incrementar page views
    const currentPageViews = parseInt(sessionStorage.getItem('pageViews') || '0')
    sessionStorage.setItem('pageViews', (currentPageViews + 1).toString())

    // Verificações iniciais
    checkSystemHealth()
    updateErrorMetrics()
    updatePerformanceMetrics()
    updateUserMetrics()

    // Intervalos de monitoramento
    intervalsRef.current.health = setInterval(checkSystemHealth, 30000) // 30s
    intervalsRef.current.error = setInterval(updateErrorMetrics, 5000) // 5s
    intervalsRef.current.performance = setInterval(updatePerformanceMetrics, 10000) // 10s
    intervalsRef.current.user = setInterval(updateUserMetrics, 1000) // 1s

    // Monitorar interações do usuário
    if (!listenersRef.current) {
      const trackInteraction = () => {
        const current = parseInt(sessionStorage.getItem('interactions') || '0')
        sessionStorage.setItem('interactions', (current + 1).toString())
        updateUserMetrics()
      }

      // Adicionar listeners de interação
      document.addEventListener('click', trackInteraction)
      document.addEventListener('keydown', trackInteraction)
      document.addEventListener('scroll', trackInteraction)
      listenersRef.current = true
    }

    return cleanup
  }, [isMonitoring, checkSystemHealth, updateErrorMetrics, updatePerformanceMetrics, updateUserMetrics, cleanup])

  // Parar monitoramento
  const stopMonitoring = useCallback(() => {
    cleanup()
  }, [cleanup])

  // Obter status geral do sistema
  const getSystemStatus = useCallback(() => {
    const { health, errors, performance } = metrics

    if (health.database === 'offline' || health.api === 'offline') {
      return 'critical'
    }

    if (errors.critical > 0 || errors.recent > 10) {
      return 'warning'
    }

    if (performance.loadTime > 2000 || (performance.memoryUsage && performance.memoryUsage > 80)) {
      return 'warning'
    }

    return 'healthy'
  }, [metrics])

  // Obter recomendações baseadas nas métricas
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = []
    const { performance, errors, health } = metrics

    if (health.database === 'offline') {
      recommendations.push('Verificar conexão com o banco de dados')
    }

    if (health.api === 'offline') {
      recommendations.push('Verificar conectividade da API')
    }

    if (errors.critical > 0) {
      recommendations.push(`Resolver ${errors.critical} erro(s) crítico(s)`)
    }

    if (errors.recent > 5) {
      recommendations.push('Investigar erros recentes')
    }

    if (performance.loadTime > 2000) {
      recommendations.push('Otimizar tempo de carregamento')
    }

    if (performance.memoryUsage && performance.memoryUsage > 80) {
      recommendations.push('Otimizar uso de memória')
    }

    return recommendations
  }, [metrics])

  // Auto-iniciar monitoramento apenas uma vez
  useEffect(() => {
    const cleanupFn = startMonitoring()
    return cleanupFn
  }, []) // Array vazio para executar apenas uma vez

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return cleanup
  }, [cleanup])

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring()
    }

    return () => {
      if (intervalsRef.current) {
        Object.values(intervalsRef.current).forEach(interval => {
          if (interval) clearInterval(interval)
        })
      }
    }
  }, [isMonitoring]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkSystemHealth,
    updateErrorMetrics,
    getSystemStatus,
    getRecommendations
  }
} 