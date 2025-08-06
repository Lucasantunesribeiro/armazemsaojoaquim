'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Language, 
  Translation, 
  translations, 
  detectLanguageFromUrl, 
  getStoredLanguage 
} from '@/lib/translations'

interface UseTranslationsReturn {
  t: (key: string) => string
  language: Language
  translations: Translation
  isReady: boolean
}

export function useTranslations(): UseTranslationsReturn {
  const [language, setLanguage] = useState<Language>('pt')
  const [isReady, setIsReady] = useState(false)
  const pathname = usePathname()

  // Optimize language detection with memoization
  const detectedLanguage = useMemo(() => {
    try {
      return detectLanguageFromUrl(pathname)
    } catch (error) {
      console.error('Error detecting language from URL:', error)
      return 'pt'
    }
  }, [pathname])

  useEffect(() => {
    // FAST INITIALIZATION - no async operations in useEffect
    let currentLanguage: Language = 'pt'
    
    try {
      // Priority: URL language > localStorage > default
      if (detectedLanguage) {
        currentLanguage = detectedLanguage
      } else if (typeof window !== 'undefined') {
        const storedLanguage = getStoredLanguage()
        currentLanguage = storedLanguage
      }
      
      setLanguage(currentLanguage)
      setIsReady(true)
      
    } catch (error) {
      console.error('Error in useTranslations setup:', error)
      // Fallback: always ensure hook is ready with Portuguese
      setLanguage('pt')
      setIsReady(true)
    }
  }, [detectedLanguage])

  // Memoized translation function for performance
  const t = useMemo(() => {
    return (key: string): string => {
      try {
        // Fast validation
        if (!key || typeof key !== 'string') {
          return key || ''
        }

        const keys = key.split('.')
        let value: any = translations[language] || translations['pt'] // Fallback to Portuguese
        
        // Optimized nested key access
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k]
          } else {
            // Key doesn't exist, return original key for debugging
            return key
          }
        }
        
        // Return string value or fallback to key
        return typeof value === 'string' ? value : key
        
      } catch (error) {
        console.error('Translation error for key:', key, error)
        return key
      }
    }
  }, [language])

  return {
    t,
    language,
    translations: translations[language] || translations['pt'],
    isReady
  }
}