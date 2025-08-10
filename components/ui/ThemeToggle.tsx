'use client'

import React from 'react'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const themeToggleVariants = cva(
  "inline-flex items-center justify-center rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border bg-background hover:bg-surface text-text-primary hover:text-text-primary",
        outline: "border-2 border-border bg-transparent hover:bg-surface text-text-primary",
        ghost: "border-transparent bg-transparent hover:bg-surface text-text-primary",
        subtle: "border-border/50 bg-surface/50 hover:bg-surface text-text-secondary hover:text-text-primary"
      },
      size: {
        sm: "h-8 w-8 text-sm",
        default: "h-10 w-10",
        lg: "h-12 w-12 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

interface ThemeToggleProps extends VariantProps<typeof themeToggleVariants> {
  className?: string
  showLabel?: boolean
  showDropdown?: boolean
}

export function ThemeToggle({ 
  className, 
  variant, 
  size, 
  showLabel = false,
  showDropdown = false 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ] as const

  const currentThemeOption = themeOptions.find(option => option.value === theme)
  const CurrentIcon = currentThemeOption?.icon || Sun

  if (showDropdown) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            themeToggleVariants({ variant, size }),
            "gap-2 px-3",
            showLabel && "w-auto",
            className
          )}
          aria-label={`Current theme: ${currentThemeOption?.label}. Click to change theme`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <CurrentIcon className="h-4 w-4" />
          {showLabel && (
            <span className="text-sm font-medium">
              {currentThemeOption?.label}
            </span>
          )}
          <Palette className="h-3 w-3 opacity-50" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-surface-elevated shadow-lg">
              <div className="p-1">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        "hover:bg-surface focus-visible:bg-surface focus-visible:outline-none",
                        isSelected && "bg-surface text-text-primary font-medium",
                        !isSelected && "text-text-secondary"
                      )}
                      role="menuitem"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                      {option.value === 'system' && (
                        <span className="ml-auto text-xs text-text-muted">
                          ({resolvedTheme})
                        </span>
                      )}
                      {isSelected && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-current" />
                      )}
                    </button>
                  )
                })}
              </div>
              
              <div className="border-t border-border p-2">
                <div className="text-xs text-text-muted px-3 py-1">
                  System preference: {resolvedTheme}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        themeToggleVariants({ variant, size }),
        showLabel && "gap-2 px-3 w-auto",
        className
      )}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current theme: ${currentThemeOption?.label}. Click to toggle`}
    >
      <CurrentIcon className="h-4 w-4" />
      {showLabel && (
        <span className="text-sm font-medium">
          {currentThemeOption?.label}
        </span>
      )}
    </button>
  )
}

// Animated theme toggle with smooth transitions
export function AnimatedThemeToggle({ 
  className, 
  variant = "default", 
  size = "default" 
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        themeToggleVariants({ variant, size }),
        "relative overflow-hidden",
        isAnimating && "animate-pulse",
        className
      )}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
      disabled={isAnimating}
    >
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        resolvedTheme === 'dark' ? "rotate-0 scale-100" : "rotate-90 scale-0"
      )}>
        <Moon className="h-4 w-4" />
      </div>
      
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out",
        resolvedTheme === 'light' ? "rotate-0 scale-100" : "-rotate-90 scale-0"
      )}>
        <Sun className="h-4 w-4" />
      </div>
      
      {/* Animated background */}
      <div className={cn(
        "absolute inset-0 rounded-lg transition-all duration-500 ease-in-out",
        resolvedTheme === 'dark' 
          ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20" 
          : "bg-gradient-to-br from-yellow-200/20 to-orange-200/20",
        isAnimating && "animate-pulse"
      )} />
    </button>
  )
}

// Theme status indicator
export function ThemeIndicator({ className }: { className?: string }) {
  const { theme, resolvedTheme, systemTheme } = useTheme()

  return (
    <div className={cn("flex items-center gap-2 text-sm text-text-muted", className)}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        resolvedTheme === 'dark' ? "bg-blue-500" : "bg-yellow-500"
      )} />
      <span>
        {theme === 'system' ? `System (${systemTheme})` : theme}
      </span>
    </div>
  )
}

export default ThemeToggle