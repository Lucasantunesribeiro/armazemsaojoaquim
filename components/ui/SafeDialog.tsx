"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SafeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface SafeDialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  onClick?: () => void
}

interface SafeDialogContentProps {
  className?: string
  children: React.ReactNode
  onClose?: () => void
}

interface SafeDialogHeaderProps {
  children: React.ReactNode
}

interface SafeDialogTitleProps {
  children: React.ReactNode
}

interface SafeDialogDescriptionProps {
  children: React.ReactNode
}

export function SafeDialog({ open, onOpenChange, children }: SafeDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  if (!isMounted) {
    return null
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SafeDialogTrigger) {
          return React.cloneElement(child as React.ReactElement<SafeDialogTriggerProps>, {
            onClick: () => handleOpenChange(true)
          })
        }
        return child
      })}
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => handleOpenChange(false)}
          />
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === SafeDialogContent) {
              return React.cloneElement(child as React.ReactElement<SafeDialogContentProps>, {
                onClose: () => handleOpenChange(false)
              })
            }
            return null
          })}
        </div>
      )}
    </>
  )
}

export function SafeDialogTrigger({ asChild, children, onClick }: SafeDialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: React.MouseEvent) => {
        if ((children as any).props?.onClick) {
          (children as any).props.onClick(e)
        }
        onClick?.()
      }
    })
  }

  return (
    <button onClick={onClick} className="inline-flex items-center justify-center">
      {children}
    </button>
  )
}

interface SafeDialogContentPropsWithClose extends SafeDialogContentProps {
  onClose?: () => void
}

export function SafeDialogContent({ className, children, onClose }: SafeDialogContentPropsWithClose) {
  return (
    <div
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function SafeDialogHeader({ children }: SafeDialogHeaderProps) {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
      {children}
    </div>
  )
}

export function SafeDialogTitle({ children }: SafeDialogTitleProps) {
  return (
    <h3 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h3>
  )
}

export function SafeDialogDescription({ children }: SafeDialogDescriptionProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  )
}

// Export aliases for easier migration
export const Dialog = SafeDialog
export const DialogTrigger = SafeDialogTrigger  
export const DialogContent = SafeDialogContent
export const DialogHeader = SafeDialogHeader
export const DialogTitle = SafeDialogTitle
export const DialogDescription = SafeDialogDescription