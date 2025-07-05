'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Locale = 'pt' | 'en' | 'es' | 'fr'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

const translations = {
  pt: {
    'nav.home': 'Home',
    'nav.about': 'Sobre',
    'nav.menu': 'Cardápio',
    'nav.blog': 'Blog',
    'nav.contact': 'Contato',
    'nav.reservations': 'Reservas',
    'hero.title': 'Armazém São Joaquim',
    'hero.subtitle': '"En esta casa tenemos memoria"',
    'hero.description': 'Restaurante histórico em Santa Teresa com 170 anos de história, drinks excepcionais e gastronomia única.',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.back': 'Voltar',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.menu': 'Menu',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.reservations': 'Reservations',
    'hero.title': 'Armazém São Joaquim',
    'hero.subtitle': '"En esta casa tenemos memoria"',
    'hero.description': 'Historic restaurant in Santa Teresa with 170 years of history, exceptional drinks and unique gastronomy.',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Acerca',
    'nav.menu': 'Menú',
    'nav.blog': 'Blog',
    'nav.contact': 'Contacto',
    'nav.reservations': 'Reservas',
    'hero.title': 'Armazém São Joaquim',
    'hero.subtitle': '"En esta casa tenemos memoria"',
    'hero.description': 'Restaurante histórico en Santa Teresa con 170 años de historia, tragos excepcionales y gastronomía única.',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.back': 'Volver',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.menu': 'Menu',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.reservations': 'Réservations',
    'hero.title': 'Armazém São Joaquim',
    'hero.subtitle': '"En esta casa tenemos memoria"',
    'hero.description': 'Restaurant historique à Santa Teresa avec 170 ans d`histoire, cocktails exceptionnels et gastronomie unique.',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.back': 'Retour',
  }
}

type TranslationKey = keyof typeof translations.pt
type Translations = Record<Locale, Record<TranslationKey, string>>

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    const browserLocale = navigator.language.split('-')[0] as Locale
    
    const supportedLocales: Locale[] = ['pt', 'en', 'es', 'fr']
    const initialLocale = savedLocale || 
      (supportedLocales.includes(browserLocale) ? browserLocale : 'pt')
    
    setLocaleState(initialLocale)
    setIsInitialized(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }

  const t = (key: string): string => {
    const translation = (translations as Translations)[locale]?.[key as TranslationKey]
    return translation || key
  }

  if (!isInitialized) {
    return null
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
} 