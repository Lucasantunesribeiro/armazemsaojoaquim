'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemTheme
    setThemeState(initialTheme)
    updateDocumentTheme(initialTheme)
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (mediaQuery.addEventListener) {
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light'
          setThemeState(newTheme)
          updateDocumentTheme(newTheme)
        }
      }
      mediaQuery.addEventListener('change', handleChange)
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    
    setIsInitialized(true)
  }, [])

  const updateDocumentTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1A1A1A' : '#F4C430')
    }
    
    const metaStatusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (metaStatusBarStyle) {
      metaStatusBarStyle.setAttribute('content', newTheme === 'dark' ? 'black-translucent' : 'default')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    updateDocumentTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  if (!isInitialized) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default useTheme 