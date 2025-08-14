'use client'

import { ReactNode } from 'react'
import SupabaseProvider from './SupabaseProvider'
import { ThemeProvider as NextThemesProvider } from './ThemeProvider'
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext'
import { MobileMenuProvider } from './MobileMenuProvider'
import { NotificationProvider } from './NotificationProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ToastProvider } from '@/contexts/ToastContext'
import NotificationSystem from '../ui/NotificationSystem'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <NextThemesProvider>
      <AppThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <SupabaseProvider>
              <NotificationProvider>
                <MobileMenuProvider>
                  {children}
                  {/* Sistema de notificações global */}
                  <NotificationSystem />
                  {/* Toaster do Sonner para toast simples */}
                  <Toaster />
                </MobileMenuProvider>
              </NotificationProvider>
            </SupabaseProvider>
          </ToastProvider>
        </LanguageProvider>
      </AppThemeProvider>
    </NextThemesProvider>
  )
} 