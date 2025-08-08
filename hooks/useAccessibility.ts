'use client'

import { useEffect, useState } from 'react'

interface AccessibilityPreferences {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersColorScheme: 'light' | 'dark' | 'no-preference'
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  keyboardNavigation: boolean
}

interface KeyboardNavigationState {
  isUsingKeyboard: boolean
  focusedElement: string | null
  lastFocusedElement: string | null
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'no-preference',
    fontSize: 'medium',
    keyboardNavigation: false
  })

  const [keyboardNavigation, setKeyboardNavigation] = useState<KeyboardNavigationState>({
    isUsingKeyboard: false,
    focusedElement: null,
    lastFocusedElement: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detectar preferência de movimento reduzido
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotion = () => {
      setPreferences(prev => ({ ...prev, prefersReducedMotion: reducedMotionQuery.matches }))
    }
    updateReducedMotion()
    reducedMotionQuery.addEventListener('change', updateReducedMotion)

    // Detectar preferência de alto contraste
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const updateHighContrast = () => {
      setPreferences(prev => ({ ...prev, prefersHighContrast: highContrastQuery.matches }))
    }
    updateHighContrast()
    highContrastQuery.addEventListener('change', updateHighContrast)

    // Detectar preferência de tema
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)')
    const updateColorScheme = () => {
      let scheme: 'light' | 'dark' | 'no-preference' = 'no-preference'
      if (darkModeQuery.matches) scheme = 'dark'
      else if (lightModeQuery.matches) scheme = 'light'
      
      setPreferences(prev => ({ ...prev, prefersColorScheme: scheme }))
    }
    updateColorScheme()
    darkModeQuery.addEventListener('change', updateColorScheme)
    lightModeQuery.addEventListener('change', updateColorScheme)

    // Detectar navegação por teclado
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setKeyboardNavigation(prev => ({ ...prev, isUsingKeyboard: true }))
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }))
      }
    }

    const handleMouseDown = () => {
      setKeyboardNavigation(prev => ({ ...prev, isUsingKeyboard: false }))
    }

    const handleFocusIn = (event: FocusEvent) => {
      const element = event.target as HTMLElement
      const elementId = element.id || element.tagName.toLowerCase()
      
      setKeyboardNavigation(prev => ({
        ...prev,
        lastFocusedElement: prev.focusedElement,
        focusedElement: elementId
      }))
    }

    const handleFocusOut = () => {
      setKeyboardNavigation(prev => ({
        ...prev,
        lastFocusedElement: prev.focusedElement,
        focusedElement: null
      }))
    }

    // Carregar preferências salvas
    const savedPreferences = localStorage.getItem('accessibility-preferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Erro ao carregar preferências de acessibilidade:', error)
      }
    }

    // Event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      reducedMotionQuery.removeEventListener('change', updateReducedMotion)
      highContrastQuery.removeEventListener('change', updateHighContrast)
      darkModeQuery.removeEventListener('change', updateColorScheme)
      lightModeQuery.removeEventListener('change', updateColorScheme)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  // Salvar preferências quando mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences))
    }
  }, [preferences])

  const updateFontSize = (size: AccessibilityPreferences['fontSize']) => {
    setPreferences(prev => ({ ...prev, fontSize: size }))
    
    // Aplicar classe CSS global para tamanho da fonte
    if (typeof document !== 'undefined') {
      document.documentElement.className = document.documentElement.className
        .replace(/font-size-\w+/g, '')
      document.documentElement.classList.add(`font-size-${size}`)
    }
  }

  const toggleHighContrast = () => {
    const newValue = !preferences.prefersHighContrast
    setPreferences(prev => ({ ...prev, prefersHighContrast: newValue }))
    
    // Aplicar classe CSS global para alto contraste
    if (typeof document !== 'undefined') {
      if (newValue) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    }
  }

  const toggleReducedMotion = () => {
    const newValue = !preferences.prefersReducedMotion
    setPreferences(prev => ({ ...prev, prefersReducedMotion: newValue }))
    
    // Aplicar classe CSS global para movimento reduzido
    if (typeof document !== 'undefined') {
      if (newValue) {
        document.documentElement.classList.add('reduced-motion')
      } else {
        document.documentElement.classList.remove('reduced-motion')
      }
    }
  }

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof document === 'undefined') return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remover o elemento após um tempo
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const focusElement = (selector: string) => {
    if (typeof document === 'undefined') return

    const element = document.querySelector(selector) as HTMLElement
    if (element && element.focus) {
      element.focus()
      return true
    }
    return false
  }

  const skipToContent = () => {
    return focusElement('#main-content, main, [role="main"]')
  }

  const skipToNavigation = () => {
    return focusElement('#navigation, nav, [role="navigation"]')
  }

  return {
    preferences,
    keyboardNavigation,
    updateFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    announceToScreenReader,
    focusElement,
    skipToContent,
    skipToNavigation
  }
}

// Hook para gerenciar foco automático
export function useAutoFocus(shouldFocus: boolean = false, selector?: string) {
  useEffect(() => {
    if (!shouldFocus || typeof document === 'undefined') return

    const focusTarget = selector 
      ? document.querySelector(selector) as HTMLElement
      : document.querySelector('[data-autofocus]') as HTMLElement

    if (focusTarget && focusTarget.focus) {
      // Pequeno delay para garantir que o elemento foi renderizado
      setTimeout(() => {
        focusTarget.focus()
      }, 100)
    }
  }, [shouldFocus, selector])
}

// Hook para navegação por teclado em listas
export function useKeyboardListNavigation<T extends HTMLElement>(
  items: T[],
  onSelect?: (item: T, index: number) => void
) {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (items.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => {
            const nextIndex = prev < items.length - 1 ? prev + 1 : 0
            items[nextIndex]?.focus()
            return nextIndex
          })
          break
          
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : items.length - 1
            items[nextIndex]?.focus()
            return nextIndex
          })
          break
          
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (selectedIndex >= 0 && items[selectedIndex] && onSelect) {
            onSelect(items[selectedIndex], selectedIndex)
          }
          break
          
        case 'Escape':
          setSelectedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onSelect])

  return {
    selectedIndex,
    setSelectedIndex
  }
}

// Hook para gerenciar regiões ARIA live
export function useAriaLive() {
  const [liveRegion, setLiveRegion] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    // Criar região ARIA live se não existir
    let region = document.getElementById('aria-live-region') as HTMLDivElement
    if (!region) {
      region = document.createElement('div')
      region.id = 'aria-live-region'
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      document.body.appendChild(region)
    }

    setLiveRegion(region)

    return () => {
      if (region && region.parentNode) {
        region.parentNode.removeChild(region)
      }
    }
  }, [])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message

      // Limpar após um tempo
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  return { announce }
}