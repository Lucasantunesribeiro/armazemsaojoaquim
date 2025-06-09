'use client'

import { useState, useEffect } from 'react'
import { blogApi, menuApi, reservasApi, analyticsApi, apiUtils } from '../api'
import type { BlogPost, MenuItem, Reserva } from '../api'

// ============================
// BLOG HOOKS
// ============================

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await blogApi.getAllPosts()
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(apiUtils.formatError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return { posts, loading, error, refetch: fetchPosts }
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const data = await blogApi.getPostBySlug(slug)
        setPost(data)
        setError(null)
      } catch (err) {
        setError(apiUtils.formatError(err))
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  return { post, loading, error }
}

export function useBlogSearch() {
  const [results, setResults] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      const data = await blogApi.searchPosts(searchTerm)
      setResults(data)
      setError(null)
    } catch (err) {
      setError(apiUtils.formatError(err))
    } finally {
      setLoading(false)
    }
  }

  return { results, search, loading, error }
}

// ============================
// MENU HOOKS
// ============================

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const data = await menuApi.getAllItems()
        setItems(data)
        setError(null)
      } catch (err) {
        setError(apiUtils.formatError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  return { items, loading, error }
}

export function useMenuCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await menuApi.getCategories()
        setCategories(data)
        setError(null)
      } catch (err) {
        setError(apiUtils.formatError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

export function useMenuSearch() {
  const [results, setResults] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      const data = await menuApi.searchItems(searchTerm)
      setResults(data)
      setError(null)
    } catch (err) {
      setError(apiUtils.formatError(err))
    } finally {
      setLoading(false)
    }
  }

  return { results, search, loading, error }
}

// ============================
// RESERVATIONS HOOKS
// ============================

export function useUserReservations(userId: string | undefined) {
  const [reservations, setReservations] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setReservations([])
      setLoading(false)
      return
    }

    const fetchReservations = async () => {
      try {
        setLoading(true)
        const data = await reservasApi.getUserReservations(userId)
        setReservations(data)
        setError(null)
      } catch (err) {
        setError(apiUtils.formatError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [userId])

  const refetch = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await reservasApi.getUserReservations(userId)
      setReservations(data)
      setError(null)
    } catch (err) {
      setError(apiUtils.formatError(err))
    } finally {
      setLoading(false)
    }
  }

  return { reservations, loading, error, refetch }
}

export function useReservationMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReservation = async (reserva: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)
      const data = await reservasApi.createReservation(reserva)
      return data
    } catch (err) {
      const errorMessage = apiUtils.formatError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateReservation = async (id: string, updates: Partial<Reserva>) => {
    try {
      setLoading(true)
      setError(null)
      const data = await reservasApi.updateReservation(id, updates)
      return data
    } catch (err) {
      const errorMessage = apiUtils.formatError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteReservation = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await reservasApi.deleteReservation(id)
    } catch (err) {
      const errorMessage = apiUtils.formatError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async (data: string, horario: string) => {
    try {
      return await reservasApi.checkAvailability(data, horario)
    } catch (err) {
      setError(apiUtils.formatError(err))
      return false
    }
  }

  return {
    createReservation,
    updateReservation,
    deleteReservation,
    checkAvailability,
    loading,
    error
  }
}

// ============================
// ANALYTICS HOOKS
// ============================

export function useMenuStats() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await analyticsApi.getMenuStats()
        setStats(data)
        setError(null)
      } catch (err) {
        setError(apiUtils.formatError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useReservationStats(userId?: string) {
  const [stats, setStats] = useState<{
    total: number
    confirmed: number
    pending: number
    cancelled: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await analyticsApi.getReservationStats(userId)
        setStats(data)
        setError(null)
      } catch (err) {
        setError(apiUtils.formatError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  return { stats, loading, error }
} 