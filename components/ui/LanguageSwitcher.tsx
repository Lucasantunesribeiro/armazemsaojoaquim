'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface Language {
  code: 'pt' | 'en'
  name: string
  flag: string
  displayName: string
}

const languages: Language[] = [
  {
    code: 'pt',
    name: 'Português',
    flag: '🇧🇷',
    displayName: 'PT'
  },
  {
    code: 'en', 
    name: 'English',
    flag: '🇺🇸',
    displayName: 'EN'
  }
]

interface LanguageSwitcherProps {
  isScrolled?: boolean
  showDropdown?: boolean
  className?: string
}

export default function LanguageSwitcher({ 
  isScrolled = false, 
  showDropdown = true,
  className = ""
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { language, switchLanguage, isLoading } = useLanguage()
  const pathname = usePathname()

  // Get current language object
  const currentLanguage = languages.find(l => l.code === language) || languages[0]

  // Toggle language function
  const toggleLanguage = async () => {
    if (isLoading) return

    const newLanguage = currentLanguage.code === 'pt' ? 'en' : 'pt'
    
    try {
      await switchLanguage(newLanguage)
      setIsOpen(false)
    } catch (error) {
      console.error('Error switching language:', error)
    }
  }

  // Handle dropdown selection
  const selectLanguage = async (selectedLang: Language) => {
    if (selectedLang.code === currentLanguage.code || isLoading) return
    
    try {
      await switchLanguage(selectedLang.code)
      setIsOpen(false)
    } catch (error) {
      console.error('Error switching language:', error)
    }
  }

  if (showDropdown) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            flex items-center rounded-xl transition-all duration-300 hover:scale-105
            ${isScrolled 
              ? 'px-2.5 py-2 text-sm' 
              : 'px-3 py-2.5 text-[15px]'
            }
            ${isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
            }
          `}
          aria-label={`Idioma atual: ${currentLanguage.name}. Clique para alterar`}
          title={`Alterar idioma para ${currentLanguage.code === 'pt' ? 'English' : 'Português'}`}
        >
          <Globe className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} mr-1.5`} />
          <span className="font-semibold tracking-wide">{currentLanguage.displayName}</span>
          <ChevronDown 
            className={`
              ml-1 transition-all duration-300
              ${isScrolled ? 'w-3 h-3' : 'w-3.5 h-3.5'}
              ${isOpen ? 'rotate-180' : 'rotate-0'}
            `} 
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 backdrop-blur-xl z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => selectLanguage(language)}
                disabled={isLoading}
                className={`
                  flex items-center w-full px-4 py-3 text-sm transition-colors duration-200
                  ${language.code === currentLanguage.code
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="text-lg mr-3">{language.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{language.name}</span>
                  <span className="text-xs opacity-75">{language.displayName}</span>
                </div>
                {language.code === currentLanguage.code && (
                  <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Simple toggle button (no dropdown)
  return (
    <button
      onClick={toggleLanguage}
      disabled={isLoading}
      className={`
        flex items-center rounded-xl transition-all duration-300 hover:scale-105
        ${isScrolled 
          ? 'px-2.5 py-2 text-sm' 
          : 'px-3 py-2.5 text-[15px]'
        }
        ${isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
        }
        ${className}
      `}
      aria-label={`Idioma atual: ${currentLanguage.name}. Clique para alterar para ${currentLanguage.code === 'pt' ? 'English' : 'Português'}`}
      title={`Alterar idioma para ${currentLanguage.code === 'pt' ? 'English' : 'Português'}`}
    >
      <Globe className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} mr-1.5`} />
      <span className="font-semibold tracking-wide">
        {isLoading ? '...' : currentLanguage.displayName}
      </span>
    </button>
  )
}