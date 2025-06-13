'use client'

import { ReactNode } from 'react'
import { SupabaseProvider } from './SupabaseProvider'
import { ThemeProvider } from './ThemeProvider'

interface ProvidersProps {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </ThemeProvider>
  )
} 