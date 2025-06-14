'use client'

import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  'aria-label'?: string
  'aria-describedby'?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    children,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 text-center relative overflow-hidden'
    
    const variants = {
      primary: 'bg-amarelo-armazem text-madeira-escura hover:bg-yellow-500 focus:ring-amarelo-armazem shadow-md hover:shadow-lg active:bg-yellow-600 active:transform active:scale-95',
      secondary: 'bg-madeira-escura text-white hover:bg-amber-900 focus:ring-madeira-escura shadow-md hover:shadow-lg active:bg-amber-800 active:transform active:scale-95',
      outline: 'border-2 border-madeira-escura text-madeira-escura hover:bg-madeira-escura hover:text-white focus:ring-madeira-escura active:bg-amber-900',
      ghost: 'text-madeira-escura hover:bg-cinza-claro focus:ring-cinza-medio active:bg-gray-200'
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[40px] min-w-[40px]', // Minimum touch target 40px
      md: 'px-6 py-3 text-base min-h-[44px] min-w-[44px]', // Recommended touch target 44px
      lg: 'px-8 py-4 text-lg min-h-[48px] min-w-[48px]' // Large touch target 48px
    }

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        tabIndex={isDisabled ? -1 : 0}
        {...props}
      >
        {loading && (
          <div 
            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
            role="status"
            aria-label="Carregando"
            aria-hidden="false"
          />
        )}
        <span className={loading ? 'opacity-75' : 'opacity-100'}>
          {children}
        </span>
        
        {/* Ripple effect for better UX */}
        <span className="absolute inset-0 rounded-lg bg-white opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-10 active:opacity-20" />
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
export { Button }