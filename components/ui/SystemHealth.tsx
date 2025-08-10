'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Wifi, Database, Users, Clock, Zap, HardDrive } from 'lucide-react'
import { useSystemMonitoring } from '../../lib/hooks/useSystemMonitoring'
import { adminDataCache } from '../../lib/cache-manager'

export default function SystemHealth() {
  const [isVisible, setIsVisible] = useState(false)
  const { 
    metrics, 
    isMonitoring, 
    getSystemStatus, 
    getRecommendations,
    checkSystemHealth 
  } = useSystemMonitoring()

  const getStatusIcon = (status: 'online' | 'offline' | 'checking') => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'checking':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'healthy':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const systemStatus = getSystemStatus()
  const recommendations = getRecommendations()
  const cacheStats = adminDataCache.getStats()

  // Só mostrar em desenvolvimento ou se houver problemas
  const shouldShow = process.env.NODE_ENV === 'development' || 
                    systemStatus !== 'healthy'

  if (!shouldShow || !isMonitoring) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Indicador de status */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full ${getStatusColor(systemStatus)} shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform`}
        title="Status do Sistema"
      >
        <Activity className="w-6 h-6" />
      </button>

      {/* Painel detalhado */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Monitor do Sistema
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={checkSystemHealth}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Atualizar"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status dos Serviços */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Serviços
              </h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
                </div>
                {getStatusIcon(metrics.health.database)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">API</span>
                </div>
                {getStatusIcon(metrics.health.api)}
              </div>
            </div>

            {/* Estatísticas de Erro */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Erros
                </span>
                {metrics.errors.critical > 0 && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {metrics.errors.total}
                  </div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">
                    {metrics.errors.recent}
                  </div>
                  <div className="text-gray-500">Recentes</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">
                    {metrics.errors.critical}
                  </div>
                  <div className="text-gray-500">Críticos</div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex items-center mb-2">
                <Zap className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Performance
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tempo de resposta:</span>
                  <span className={`font-medium ${metrics.performance.loadTime > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.performance.loadTime.toFixed(0)}ms
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Renderização:</span>
                  <span className="font-medium">
                    {metrics.performance.renderTime.toFixed(1)}ms
                  </span>
                </div>
                
                {metrics.performance.memoryUsage && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Memória:</span>
                    <span className={`font-medium ${metrics.performance.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.performance.memoryUsage.toFixed(1)}%
                    </span>
                  </div>
                )}

                {metrics.performance.connectionSpeed && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Conexão:</span>
                    <span className="font-medium">
                      {metrics.performance.connectionSpeed}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cache */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex items-center mb-2">
                <HardDrive className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cache
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Entradas:</span>
                  <span className="font-medium text-blue-600">
                    {cacheStats.size}/{cacheStats.maxSize}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Itens armazenados:</span>
                  <span className="font-medium">
                    {cacheStats.size}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacidade:</span>
                  <span className="font-medium">
                    {((cacheStats.size / cacheStats.maxSize) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Atividade do Usuário */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sessão
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duração:</span>
                  <span className="font-medium">
                    {formatDuration(metrics.user.sessionDuration)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Páginas visitadas:</span>
                  <span className="font-medium">
                    {metrics.user.pageViews}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Interações:</span>
                  <span className="font-medium">
                    {metrics.user.interactions}
                  </span>
                </div>
              </div>
            </div>

            {/* Recomendações */}
            {recommendations.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recomendações
                  </span>
                </div>
                
                <div className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="text-xs text-yellow-600 dark:text-yellow-400">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Última verificação */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Última verificação:</span>
                </div>
                <span>
                  {metrics.health.lastCheck ? 
                    new Date(metrics.health.lastCheck).toLocaleTimeString() : 
                    'Nunca'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 