"use client"

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Paletas via CSS Custom Properties para facilitar personalização
export const themeVariables = {
  light: {
    // Location Button
    '--location-button-primary-bg': '#d97706',
    '--location-button-primary-hover': '#b45309',
    '--location-button-primary-text': '#ffffff',
    '--location-button-outline-border': '#d97706',
    '--location-button-outline-text': '#b45309',
    '--location-button-outline-bg': '#ffffff',
    '--location-button-outline-hover': '#fef3c7',

    // Toast System
    '--toast-success-bg': '#dcfce7',
    '--toast-success-border': '#16a34a',
    '--toast-success-text': '#15803d',
    '--toast-error-bg': '#fef2f2',
    '--toast-error-border': '#dc2626',
    '--toast-error-text': '#b91c1c',
    '--toast-warning-bg': '#fefce8',
    '--toast-warning-border': '#ca8a04',
    '--toast-warning-text': '#a16207',
    '--toast-info-bg': '#eff6ff',
    '--toast-info-border': '#2563eb',
    '--toast-info-text': '#1d4ed8',

    // Background and surfaces
    '--background': '#ffffff',
    '--surface': '#f9fafb',
    '--surface-elevated': '#ffffff',
    '--border': '#e5e7eb',
    '--text-primary': '#111827',
    '--text-secondary': '#6b7280',
    '--text-muted': '#9ca3af'
  },
  dark: {
    // Location Button
    '--location-button-primary-bg': '#d97706',
    '--location-button-primary-hover': '#f59e0b',
    '--location-button-primary-text': '#000000',
    '--location-button-outline-border': '#f59e0b',
    '--location-button-outline-text': '#fbbf24',
    '--location-button-outline-bg': '#111827',
    '--location-button-outline-hover': '#451a03',

    // Toast System
    '--toast-success-bg': '#14532d',
    '--toast-success-border': '#22c55e',
    '--toast-success-text': '#4ade80',
    '--toast-error-bg': '#7f1d1d',
    '--toast-error-border': '#ef4444',
    '--toast-error-text': '#f87171',
    '--toast-warning-bg': '#713f12',
    '--toast-warning-border': '#eab308',
    '--toast-warning-text': '#facc15',
    '--toast-info-bg': '#1e3a8a',
    '--toast-info-border': '#3b82f6',
    '--toast-info-text': '#60a5fa',

    // Background and surfaces
    '--background': '#111827',
    '--surface': '#1f2937',
    '--surface-elevated': '#374151',
    '--border': '#4b5563',
    '--text-primary': '#f9fafb',
    '--text-secondary': '#d1d5db',
    '--text-muted': '#9ca3af'
  }
} as const

export function applyThemeVariables(theme: ResolvedTheme) {
  const root = document.documentElement
  const vars = themeVariables[theme]
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v as string))
}

interface AppThemeProviderProps { children: React.ReactNode }

// Provider que pega valores do next-themes e aplica nossas variáveis CSS
export function ThemeProvider({ children }: AppThemeProviderProps) {
  const { theme, resolvedTheme: nextResolved, setTheme } = useNextTheme()
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const resolvedTheme = (nextResolved || 'light') as ResolvedTheme

  useEffect(() => {
    applyThemeVariables(resolvedTheme)
    const root = document.documentElement
    root.setAttribute('data-theme', resolvedTheme)
    root.style.colorScheme = resolvedTheme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#111827' : '#ffffff')
  }, [resolvedTheme])

  const toggleTheme = useCallback(() => {
    const current = (theme || 'system') as Theme
    if (current === 'system') setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    else setTheme(current === 'dark' ? 'light' : 'dark')
  }, [theme, systemTheme, setTheme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme: (theme as Theme) || 'system',
    resolvedTheme,
    setTheme: setTheme as (t: Theme) => void,
    toggleTheme,
    systemTheme
  }), [theme, resolvedTheme, systemTheme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return systemTheme
}