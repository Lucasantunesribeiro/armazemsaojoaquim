import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'outline':
        return 'bg-transparent text-gray-700 border-gray-300'
      case 'secondary':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${getVariantClasses()}
      ${className}
    `}>
      {children}
    </span>
  )
} 