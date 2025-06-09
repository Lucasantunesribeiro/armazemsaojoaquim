import React from 'react'
import { cn } from '../../lib/utils'

// ============================
// LOADING SPINNER
// ============================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-amarelo-armazem',
    white: 'border-white',
    gray: 'border-cinza-medio'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-solid border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

// ============================
// LOADING DOTS
// ============================

interface LoadingDotsProps {
  color?: 'primary' | 'white' | 'gray'
  className?: string
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  color = 'primary',
  className
}) => {
  const colorClasses = {
    primary: 'bg-amarelo-armazem',
    white: 'bg-white',
    gray: 'bg-cinza-medio'
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )
}

// ============================
// LOADING SKELETON
// ============================

interface LoadingSkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  width,
  height,
  rounded = false
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-cinza-claro',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}

// ============================
// LOADING CARD SKELETON
// ============================

export const LoadingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <LoadingSkeleton height={200} className="mb-4" />
      <LoadingSkeleton height={24} width="80%" className="mb-2" />
      <LoadingSkeleton height={16} width="60%" className="mb-4" />
      <div className="space-y-2">
        <LoadingSkeleton height={12} />
        <LoadingSkeleton height={12} width="90%" />
        <LoadingSkeleton height={12} width="70%" />
      </div>
    </div>
  )
}

// ============================
// LOADING PAGE
// ============================

interface LoadingPageProps {
  title?: string
  subtitle?: string
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Carregando...',
  subtitle = 'Preparando uma experiência única para você'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cinza-claro">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-amarelo-armazem rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-madeira-escura font-bold text-3xl">A</span>
          </div>
          <LoadingSpinner size="xl" className="absolute -top-2 -left-2" />
        </div>
        
        <h2 className="font-playfair text-2xl font-semibold text-madeira-escura mb-3">
          {title}
        </h2>
        
        <p className="text-cinza-medio mb-6">
          {subtitle}
        </p>
        
        <LoadingDots />
      </div>
    </div>
  )
}

// ============================
// LOADING OVERLAY
// ============================

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Carregando...'
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-madeira-escura font-medium">{message}</p>
      </div>
    </div>
  )
}

// ============================
// LOADING LIST
// ============================

interface LoadingListProps {
  itemCount?: number
  itemHeight?: number
}

export const LoadingList: React.FC<LoadingListProps> = ({
  itemCount = 5,
  itemHeight = 80
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
        >
          <LoadingSkeleton width={60} height={60} rounded />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton height={20} width="70%" />
            <LoadingSkeleton height={16} width="50%" />
            <LoadingSkeleton height={14} width="40%" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================
// LOADING BUTTON
// ============================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  loadingText,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}

// ============================
// LOADING GRID
// ============================

interface LoadingGridProps {
  itemCount?: number
  columns?: number
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  itemCount = 6,
  columns = 3
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-6', gridClasses[columns as keyof typeof gridClasses] || gridClasses[3])}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <LoadingCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default LoadingSpinner 