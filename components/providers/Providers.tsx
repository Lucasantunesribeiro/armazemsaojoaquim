'use client'

import { ReactNode } from 'react'
import SupabaseProvider from './SupabaseProvider'
import { ThemeProvider } from './ThemeProvider'
import { MobileMenuProvider } from './MobileMenuProvider'
import { NotificationProvider } from './NotificationProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import NotificationSystem from '../ui/NotificationSystem'

interface ProvidersProps {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SupabaseProvider>
          <NotificationProvider>
            <MobileMenuProvider>
              {children}
              {/* Sistema de notificações global */}
              <NotificationSystem />
            </MobileMenuProvider>
          </NotificationProvider>
        </SupabaseProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
} 