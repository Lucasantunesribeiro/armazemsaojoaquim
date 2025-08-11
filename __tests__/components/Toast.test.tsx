import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastComponent } from '@/components/ui/Toast'
import type { Toast } from '@/components/ui/Toast'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
})

describe('ToastComponent', () => {
  const mockOnDismiss = jest.fn()
  
  const defaultToast: Toast = {
    id: 'test-toast',
    type: 'info',
    message: 'Test message',
    title: 'Test title'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render basic toast', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      expect(screen.getByText('Test title')).toBeInTheDocument()
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should render without title', () => {
      const toast = { ...defaultToast, title: undefined }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      expect(screen.getByText('Test message')).toBeInTheDocument()
      expect(screen.queryByText('Test title')).not.toBeInTheDocument()
    })

    it('should render different toast types with correct styling', () => {
      const types: Array<Toast['type']> = ['success', 'error', 'warning', 'info']
      
      types.forEach(type => {
        const toast = { ...defaultToast, type }
        const { container } = render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
        
        const toastElement = container.querySelector('.toast-container')
        expect(toastElement).toHaveClass(`toast-${type}`)
      })
    })

    it('should render appropriate icons for each type', () => {
      const types: Array<Toast['type']> = ['success', 'error', 'warning', 'info']
      
      types.forEach(type => {
        const toast = { ...defaultToast, type }
        render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
        
        // Each type should have its specific icon
        const icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      expect(toast).toHaveAttribute('aria-live', 'polite')
      expect(toast).toHaveAttribute('aria-atomic', 'true')
      expect(toast).toHaveAttribute('aria-label', 'info notification: Test title')
    })

    it('should use alert role for error toasts', () => {
      const errorToast = { ...defaultToast, type: 'error' as const }
      render(<ToastComponent toast={errorToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('alert')
      expect(toast).toHaveAttribute('aria-live', 'assertive')
    })

    it('should be keyboard accessible', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      expect(toast).toHaveAttribute('tabIndex', '0')
    })

    it('should dismiss on Escape key', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      fireEvent.keyDown(toast, { key: 'Escape' })
      
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
    })

    it('should dismiss on Space key', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      fireEvent.keyDown(toast, { key: ' ' })
      
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
    })

    it('should have screen reader announcement', async () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      await waitFor(() => {
        const announcement = screen.getByText('info notification: Test title. Test message')
        expect(announcement).toHaveClass('sr-only')
      })
    })
  })

  describe('Dismiss Functionality', () => {
    it('should render dismiss button by default', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const dismissButton = screen.getByLabelText(/fechar notificação/i)
      expect(dismissButton).toBeInTheDocument()
    })

    it('should not render dismiss button when dismissible is false', () => {
      const toast = { ...defaultToast, dismissible: false }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const dismissButton = screen.queryByLabelText(/fechar notificação/i)
      expect(dismissButton).not.toBeInTheDocument()
    })

    it('should call onDismiss when dismiss button is clicked', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const dismissButton = screen.getByLabelText(/fechar notificação/i)
      fireEvent.click(dismissButton)
      
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
    })

    it('should have proper touch target size for dismiss button', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const dismissButton = screen.getByLabelText(/fechar notificação/i)
      expect(dismissButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
    })
  })

  describe('Progress Bar', () => {
    it('should render progress bar when duration is set', () => {
      const toast = { ...defaultToast, duration: 5000 }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const progressBar = screen.getByRole('status').querySelector('.toast-progress-bar')
      expect(progressBar).toBeInTheDocument()
    })

    it('should not render progress bar when duration is 0', () => {
      const toast = { ...defaultToast, duration: 0 }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const progressBar = screen.getByRole('status').querySelector('.toast-progress-bar')
      expect(progressBar).not.toBeInTheDocument()
    })

    it('should pause progress bar on hover', () => {
      const toast = { ...defaultToast, duration: 5000 }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const toastElement = screen.getByRole('status')
      const progressBar = toastElement.querySelector('.toast-progress-bar') as HTMLElement
      
      fireEvent.mouseEnter(toastElement)
      expect(progressBar.style.animationPlayState).toBe('paused')
      
      fireEvent.mouseLeave(toastElement)
      expect(progressBar.style.animationPlayState).toBe('running')
    })
  })

  describe('Action Buttons', () => {
    it('should render action button when provided', () => {
      const toast = {
        ...defaultToast,
        action: {
          label: 'Retry',
          onClick: jest.fn()
        }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const actionButton = screen.getByText('Retry')
      expect(actionButton).toBeInTheDocument()
    })

    it('should call action onClick when clicked', () => {
      const mockAction = jest.fn()
      const toast = {
        ...defaultToast,
        action: {
          label: 'Retry',
          onClick: mockAction
        }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const actionButton = screen.getByText('Retry')
      fireEvent.click(actionButton)
      
      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should render secondary action button', () => {
      const toast = {
        ...defaultToast,
        action: { label: 'Primary', onClick: jest.fn() },
        secondaryAction: { label: 'Secondary', onClick: jest.fn() }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('should render progress indicator', () => {
      const toast = {
        ...defaultToast,
        progress: {
          current: 50,
          total: 100,
          label: 'Upload'
        }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('50/100')).toBeInTheDocument()
    })

    it('should render expandable content', () => {
      const toast = {
        ...defaultToast,
        expandable: {
          summary: 'Show details',
          details: 'Detailed error information'
        }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const expandButton = screen.getByText(/show details/i)
      expect(expandButton).toBeInTheDocument()
      
      fireEvent.click(expandButton)
      expect(screen.getByText('Detailed error information')).toBeInTheDocument()
    })

    it('should handle copy functionality', async () => {
      const toast = {
        ...defaultToast,
        copyable: {
          text: 'Copy this text',
          label: 'Copy'
        }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const copyButton = screen.getByText('Copy')
      fireEvent.click(copyButton)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy this text')
      
      await waitFor(() => {
        expect(screen.getByText('✓ Copiado!')).toBeInTheDocument()
      })
    })
  })

  describe('Touch Gestures', () => {
    it('should handle touch start', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      fireEvent.touchStart(toast, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Should not crash and should handle touch
      expect(toast).toBeInTheDocument()
    })

    it('should dismiss on swipe', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      
      fireEvent.touchStart(toast, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchMove(toast, {
        touches: [{ clientX: 250, clientY: 100 }]
      })
      
      fireEvent.touchEnd(toast)
      
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
    })

    it('should not dismiss on small swipe', () => {
      render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      
      fireEvent.touchStart(toast, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchMove(toast, {
        touches: [{ clientX: 150, clientY: 100 }]
      })
      
      fireEvent.touchEnd(toast)
      
      expect(mockOnDismiss).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle copy error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Copy failed'))
      
      const toast = {
        ...defaultToast,
        copyable: {
          text: 'Copy this text',
          label: 'Copy'
        }
      }
      render(<ToastComponent toast={toast} onDismiss={mockOnDismiss} />)
      
      const copyButton = screen.getByText('Copy')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })
  })
})