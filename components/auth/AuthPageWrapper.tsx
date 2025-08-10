'use client'

import React from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'

interface AuthPageWrapperProps {
  children: React.ReactNode
}

export default function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  return (
    <ToastProvider maxToasts={3} defaultDuration={5000}>
      {children}
      <ToastContainer position="top-right" />
    </ToastProvider>
  )
}