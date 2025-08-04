'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminApi } from './useAdminApi'

interface DashboardStats {
  users: {
    total: number
    newThisMonth: number
    adminCount: number
  }
  reservations: {
    total: number
    active: number
    today: number
    confirmed: number
    pending: number
  }
  menu: {
    totalItems: number
    categories: number
    availableItems: number
    featuredItems: number
  }
  blog: {
    totalPosts: number
    published: number
    drafts: number
    recentPosts: number
  }
  lastUpdated: string
}

export function useDashboardStats() {
  const { adminFetch } = useAdminApi()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await adminFetch('/api/admin/dashboard/stats')
      setStats(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }, [adminFetch])

  const refreshStats = useCallback(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, loading, error, refreshStats }
}