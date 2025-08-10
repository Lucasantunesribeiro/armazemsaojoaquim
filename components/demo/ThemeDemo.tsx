'use client'

import React, { useState } from 'react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'
import LocationButton from '@/components/ui/LocationButton'
import ThemeToggle, { AnimatedThemeToggle, ThemeIndicator } from '@/components/ui/ThemeToggle'
import ThemeCustomizer from '@/components/ui/ThemeCustomizer'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { Settings, Palette, Sun, Moon, Monitor } from 'lucide-react'

function ThemeDemoContent() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [showCustomizer, setShowCustomizer] = useState(false)
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    showLoadingToast 
  } = useToastNotifications()

  const demoToasts = [
    { 
      label: 'Success Toast', 
      action: () => showSuccess('Operation completed successfully!', 'Success'),
      color: 'bg-green-500'
    },
    { 
      label: 'Error Toast', 
      action: () => showError('Something went wrong. Please try again.', 'Error'),
      color: 'bg-red-500'
    },
    { 
      label: 'Warning Toast', 
      action: () => showWarning('Please check your input before proceeding.', 'Warning'),
      color: 'bg-yellow-500'
    },
    { 
      label: 'Info Toast', 
      action: () => showInfo('Here is some helpful information.', 'Information'),
      color: 'bg-blue-500'
    },
    { 
      label: 'Loading Toast', 
      action: () => showLoadingToast('Processing your request...'),
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Theme System Demo
                </h1>
                <p className="text-text-muted">
                  Interactive demonstration of the theme system
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeIndicator />
              <ThemeToggle showLabel />
              <AnimatedThemeToggle />
              <ThemeToggle showDropdown showLabel />
              
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Theme Controls */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Theme Selection
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                      ${theme === value 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50 text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-surface-elevated rounded-lg">
                <div className="text-sm text-text-muted">
                  Current: <span className="font-medium text-text-primary">{theme}</span>
                  {theme === 'system' && (
                    <span className="text-text-muted"> (resolved: {resolvedTheme})</span>
                  )}
                </div>
              </div>
            </div>

            {/* LocationButton Demo */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Location Button Variants
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <LocationButton variant="default" size="sm">
                    Default Small
                  </LocationButton>
                  <LocationButton variant="outline" size="sm">
                    Outline Small
                  </LocationButton>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <LocationButton variant="secondary">
                    Secondary
                  </LocationButton>
                  <LocationButton variant="ghost">
                    Ghost
                  </LocationButton>
                </div>
                
                <LocationButton variant="default" size="lg" className="w-full">
                  Large Location Button
                </LocationButton>
              </div>
            </div>
          </div>

          {/* Toast Demo */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Toast Notifications
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                {demoToasts.map((toast, index) => (
                  <button
                    key={index}
                    onClick={toast.action}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border border-border 
                      hover:bg-surface-elevated transition-colors text-left
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full ${toast.color}`} />
                    <span className="text-sm font-medium text-text-primary">
                      {toast.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Current Color Palette
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Primary', class: 'bg-primary' },
                  { name: 'Success', class: 'bg-green-500' },
                  { name: 'Error', class: 'bg-red-500' },
                  { name: 'Warning', class: 'bg-yellow-500' },
                  { name: 'Info', class: 'bg-blue-500' },
                  { name: 'Surface', class: 'bg-surface border border-border' }
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`w-full h-12 rounded-lg ${color.class} mb-2`} />
                    <span className="text-xs text-text-muted">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Typography
              </h2>
              
              <div className="space-y-3">
                <div className="text-2xl font-bold text-text-primary">
                  Heading 1
                </div>
                <div className="text-xl font-semibold text-text-primary">
                  Heading 2
                </div>
                <div className="text-lg font-medium text-text-primary">
                  Heading 3
                </div>
                <div className="text-base text-text-primary">
                  Body text - primary color
                </div>
                <div className="text-base text-text-secondary">
                  Body text - secondary color
                </div>
                <div className="text-sm text-text-muted">
                  Small text - muted color
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Customizer */}
        {showCustomizer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <ThemeCustomizer 
              onClose={() => setShowCustomizer(false)}
              className="max-h-[90vh] overflow-hidden"
            />
          </div>
        )}
      </div>
      
      <ToastContainer position="top-right" />
    </div>
  )
}

export default function ThemeDemo() {
  return (
    <ThemeProvider>
      <ToastProvider maxToasts={5} defaultDuration={4000}>
        <ThemeDemoContent />
      </ToastProvider>
    </ThemeProvider>
  )
}