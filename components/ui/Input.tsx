'use client'

import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

// Validação de runtime para prevenir erros de factory/call
if (typeof cn !== 'function') {
  throw new Error('Input: função cn() não foi importada corretamente do lib/utils')
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outline'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    variant = 'default',
    id,
    'aria-describedby': ariaDescribedby,
    required,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    
    const describedBy = [
      ariaDescribedby,
      errorId,
      helperTextId
    ].filter(Boolean).join(' ') || undefined

    const baseClasses = 'w-full px-4 py-3 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400'
    
    const variants = {
      default: 'border-cinza-medio bg-white text-madeira-escura focus:border-amarelo-armazem focus:ring-amarelo-armazem',
      filled: 'border-transparent bg-cinza-claro text-madeira-escura focus:bg-white focus:border-amarelo-armazem focus:ring-amarelo-armazem',
      outline: 'border-2 border-cinza-medio bg-transparent text-madeira-escura focus:border-amarelo-armazem focus:ring-amarelo-armazem'
    }
    
    const errorClasses = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
      : ''

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-madeira-escura mb-2',
              required && "after:content-['*'] after:text-red-500 after:ml-1"
            )}
          >
            {label}
          </label>
        )}
        
        <input
          type={type}
          id={inputId}
          className={cn(
            baseClasses,
            variants[variant],
            errorClasses,
            className
          )}
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          {...props}
        />
        
        {helperText && !error && (
          <p 
            id={helperTextId}
            className="mt-2 text-sm text-cinza-medio"
            role="note"
          >
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="mt-2 text-sm text-red-600 flex items-center"
            role="alert"
            aria-live="polite"
          >
            <svg 
              className="w-4 h-4 mr-1 flex-shrink-0" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
export { Input }