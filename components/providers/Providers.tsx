'use client'

import { ReactNode } from 'react'
import { SupabaseProvider } from './SupabaseProvider'
import { ThemeProvider } from './ThemeProvider'
<<<<<<< HEAD
import { MobileMenuProvider } from './MobileMenuProvider'
=======
>>>>>>> db71da20d421fb713050462e83c63369986edb18

interface ProvidersProps {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <SupabaseProvider>
<<<<<<< HEAD
        <MobileMenuProvider>
          {children}
        </MobileMenuProvider>
=======
        {children}
>>>>>>> db71da20d421fb713050462e83c63369986edb18
      </SupabaseProvider>
    </ThemeProvider>
  )
} 