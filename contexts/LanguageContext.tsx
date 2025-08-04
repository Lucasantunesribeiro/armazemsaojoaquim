'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Language, 
  Translation, 
  translations, 
  detectLanguageFromUrl, 
  getStoredLanguage, 
  storeLanguage 
} from '@/lib/translations'

interface LanguageContextType {
  language: Language
  translations: Translation
  isLoading: boolean
  switchLanguage: (newLanguage: Language) => Promise<void>
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('pt')
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize language on mount
  useEffect(() => {
    setIsMounted(true)
    
    // Detect language from URL first, then localStorage
    const urlLanguage = detectLanguageFromUrl(pathname)
    const storedLanguage = getStoredLanguage()
    
    // PRIORIZE URL language always - if URL has /pt/ use 'pt', if /en/ use 'en'
    const initialLanguage = urlLanguage || storedLanguage
    
    console.log('🏠 Context URL:', pathname, '→ Language:', urlLanguage, '→ Final:', initialLanguage)
    
    setLanguage(initialLanguage)
    
    // Store the determined language
    storeLanguage(initialLanguage)
  }, [pathname])

  // Switch language function
  const switchLanguage = async (newLanguage: Language) => {
    if (isLoading || newLanguage === language) return

    setIsLoading(true)
    
    try {
      // Update state
      setLanguage(newLanguage)
      
      // Store in localStorage
      storeLanguage(newLanguage)
      
      // Update URL
      let newPath = pathname
      
      // Remove existing language prefix
      if (pathname.startsWith('/pt/') || pathname.startsWith('/en/')) {
        newPath = pathname.substring(3)
      } else if (pathname === '/pt' || pathname === '/en') {
        newPath = '/'
      }
      
      // Add new language prefix (EN only, PT is default)
      if (newLanguage === 'en') {
        newPath = `/en${newPath === '/' ? '' : newPath}`
      }
      
      // Navigate to new URL
      router.push(newPath)
      
    } catch (error) {
      console.error('Error switching language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Translation helper function
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return <>{children}</>
  }

  const contextValue: LanguageContextType = {
    language,
    translations: translations[language],
    isLoading,
    switchLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use the language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  
  return context
}

// Simple hook for just translations (alternative to full context)
export function useTranslations() {
  const context = useContext(LanguageContext)
  
  if (context === undefined) {
    // Fallback to Portuguese if context is not available
    return {
      t: (key: string) => {
        const keys = key.split('.')
        let value: any = translations.pt
        
        for (const k of keys) {
          value = value?.[k]
        }
        
        return value || key
      },
      language: 'pt' as Language
    }
  }
  
  return {
    t: context.t,
    language: context.language
  }
}