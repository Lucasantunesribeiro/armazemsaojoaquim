'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 max-w-md">
            {description}
          </p>
        </div>

        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </Card>
  )
}

interface ComingSoonProps {
  feature: string
  description: string
  className?: string
}

export function ComingSoon({
  feature,
  description,
  className = ''
}: ComingSoonProps) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-blue-100 rounded-full">
          <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {feature} Em Breve
          </h3>
          <p className="text-gray-600 max-w-md">
            {description}
          </p>
        </div>

        <div className="pt-2">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
            🚀 Em desenvolvimento
          </div>
        </div>
      </div>
    </Card>
  )
}