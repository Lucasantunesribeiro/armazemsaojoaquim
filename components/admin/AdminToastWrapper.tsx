'use client'

import React from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'

interface AdminToastWrapperProps {
  children: React.ReactNode
}

export default function AdminToastWrapper({ children }: AdminToastWrapperProps) {
  return (
    <ToastProvider maxToasts={4} defaultDuration={4000}>
      {children}
      <ToastContainer position="top-right" />
    </ToastProvider>
  )
}