'use client'

import { ReactNode } from 'react'
import { SupabaseProvider } from './SupabaseProvider'
import { ThemeProvider } from './ThemeProvider'
import { MobileMenuProvider } from './MobileMenuProvider'

interface ProvidersProps {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <MobileMenuProvider>
          {children}
        </MobileMenuProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
} 