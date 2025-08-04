'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    // Detect language from URL first, then localStorage
    const urlLanguage = detectLanguageFromUrl(pathname)
    const storedLanguage = getStoredLanguage()
    
    // PRIORIZE URL language always - if URL has /pt/ use 'pt', if /en/ use 'en'
    const currentLanguage = urlLanguage || storedLanguage
    
    console.log('🌍 URL Detected:', pathname, '→ Language:', urlLanguage, '→ Final:', currentLanguage)
    
    setLanguage(currentLanguage)
    setIsReady(true)
  }, [pathname])

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return {
    t,
    language,
    translations: translations[language],
    isReady
  }
}