'use client'

import React, { useState } from 'react'
import { Palette, Settings, Eye, RotateCcw, Download, Upload } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

interface ColorCustomization {
  primary: string
  secondary: string
  success: string
  error: string
  warning: string
  info: string
  background: string
  surface: string
  text: string
}

interface ThemeCustomization {
  light: ColorCustomization
  dark: ColorCustomization
}

const defaultCustomization: ThemeCustomization = {
  light: {
    primary: '#d97706',
    secondary: '#6b7280',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#ca8a04',
    info: '#2563eb',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827'
  },
  dark: {
    primary: '#f59e0b',
    secondary: '#9ca3af',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#eab308',
    info: '#3b82f6',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb'
  }
}

interface ThemeCustomizerProps {
  className?: string
  onClose?: () => void
}

export function ThemeCustomizer({ className, onClose }: ThemeCustomizerProps) {
  const { resolvedTheme } = useTheme()
  const [customization, setCustomization] = useState<ThemeCustomization>(defaultCustomization)
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light')
  const [previewMode, setPreviewMode] = useState(false)

  const updateColor = (theme: 'light' | 'dark', colorKey: keyof ColorCustomization, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [theme]: {
        ...prev[theme],
        [colorKey]: value
      }
    }))
  }

  const applyCustomization = () => {
    const root = document.documentElement
    const colors = customization[resolvedTheme]
    
    // Apply custom colors as CSS variables
    root.style.setProperty('--location-button-primary-bg', colors.primary)
    root.style.setProperty('--toast-success-border', colors.success)
    root.style.setProperty('--toast-error-border', colors.error)
    root.style.setProperty('--toast-warning-border', colors.warning)
    root.style.setProperty('--toast-info-border', colors.info)
    root.style.setProperty('--background', colors.background)
    root.style.setProperty('--surface', colors.surface)
    root.style.setProperty('--text-primary', colors.text)
  }

  const resetToDefaults = () => {
    setCustomization(defaultCustomization)
    
    // Reset CSS variables
    const root = document.documentElement
    Object.keys(defaultCustomization.light).forEach(key => {
      root.style.removeProperty(`--${key}`)
    })
  }

  const exportTheme = () => {
    const themeData = JSON.stringify(customization, null, 2)
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'custom-theme.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setCustomization(imported)
      } catch (error) {
        console.error('Failed to import theme:', error)
      }
    }
    reader.readAsText(file)
  }

  const ColorInput = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    description?: string
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 rounded-lg border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-xs text-text-muted">{description}</p>
      )}
    </div>
  )

  return (
    <div className={cn(
      "w-full max-w-2xl bg-surface-elevated border border-border rounded-xl shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Theme Customizer
            </h2>
            <p className="text-sm text-text-muted">
              Customize colors and appearance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              previewMode 
                ? "bg-primary text-white" 
                : "bg-surface hover:bg-surface-elevated text-text-secondary"
            )}
            title={previewMode ? "Exit preview" : "Preview changes"}
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-surface hover:bg-surface-elevated text-text-secondary transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Theme Tabs */}
      <div className="flex border-b border-border">
        {(['light', 'dark'] as const).map((theme) => (
          <button
            key={theme}
            onClick={() => setActiveTab(theme)}
            className={cn(
              "flex-1 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === theme
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-text-secondary hover:text-text-primary hover:bg-surface"
            )}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
          </button>
        ))}
      </div>

      {/* Color Customization */}
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorInput
            label="Primary Color"
            value={customization[activeTab].primary}
            onChange={(value) => updateColor(activeTab, 'primary', value)}
            description="Main brand color for buttons and accents"
          />
          
          <ColorInput
            label="Secondary Color"
            value={customization[activeTab].secondary}
            onChange={(value) => updateColor(activeTab, 'secondary', value)}
            description="Secondary elements and borders"
          />
          
          <ColorInput
            label="Success Color"
            value={customization[activeTab].success}
            onChange={(value) => updateColor(activeTab, 'success', value)}
            description="Success messages and confirmations"
          />
          
          <ColorInput
            label="Error Color"
            value={customization[activeTab].error}
            onChange={(value) => updateColor(activeTab, 'error', value)}
            description="Error messages and warnings"
          />
          
          <ColorInput
            label="Warning Color"
            value={customization[activeTab].warning}
            onChange={(value) => updateColor(activeTab, 'warning', value)}
            description="Warning messages and cautions"
          />
          
          <ColorInput
            label="Info Color"
            value={customization[activeTab].info}
            onChange={(value) => updateColor(activeTab, 'info', value)}
            description="Information messages and tips"
          />
          
          <ColorInput
            label="Background Color"
            value={customization[activeTab].background}
            onChange={(value) => updateColor(activeTab, 'background', value)}
            description="Main background color"
          />
          
          <ColorInput
            label="Surface Color"
            value={customization[activeTab].surface}
            onChange={(value) => updateColor(activeTab, 'surface', value)}
            description="Cards and elevated surfaces"
          />
          
          <ColorInput
            label="Text Color"
            value={customization[activeTab].text}
            onChange={(value) => updateColor(activeTab, 'text', value)}
            description="Primary text color"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            onClick={exportTheme}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={applyCustomization}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer