import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ToastComponent } from '@/components/ui/Toast'
import type { Toast } from '@/components/ui/Toast'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'
import { useToastNotifications } from '@/hooks/useToastNotifications'

// Mock timers
jest.useFakeTimers()

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
})

// Mock window.innerWidth for mobile detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

// Test component to trigger toasts
const TestToastTrigger = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    showLoadingToast,
    clearToasts
  } = useToastNotifications()
  
  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
      <button onClick={() => showLoadingToast('Loading...')}>Show Loading</button>
      <button onClick={() => clearToasts()}>Clear All</button>
      <button onClick={() => {
        showSuccess('Success with action', 'Action Toast', {
          action: {
            label: 'Action',
            onClick: () => console.log('Action clicked')
          },
          secondaryAction: {
            label: 'Secondary',
            onClick: () => console.log('Secondary clicked')
          }
        })
      }}>Show Success with Actions</button>
      <button onClick={() => {
        showInfo('Info with progress', 'Progress Toast', {
          progress: {
            current: 50,
            total: 100,
            label: 'Uploading'
          }
        })
      }}>Show Progress Toast</button>
      <button onClick={() => {
        showError('Error with details', 'Expandable Error', {
          expandable: {
            summary: 'Show details',
            details: 'Detailed error information here'
          }
        })
      }}>Show Expandable Toast</button>
      <button onClick={() => {
        showInfo('Copy this text', 'Copyable Toast', {
          copyable: {
            text: 'Text to copy',
            label: 'Copy'
          }
        })
      }}>Show Copyable Toast</button>
    </div>
  )
}

describe('Enhanced Toast System', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
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
      mockOnDismiss.mockClear()
    })

    describe('Basic Rendering', () => {
      it('should render basic toast with all elements', () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        expect(screen.getByText('Test title')).toBeInTheDocument()
        expect(screen.getByText('Test message')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /fechar notificação/i })).toBeInTheDocument()
        expect(screen.getByRole('status')).toBeInTheDocument()
      })

      it('should render different toast types with correct styling', () => {
        const types: Array<Toast['type']> = ['success', 'error', 'warning', 'info']
        
        types.forEach(type => {
          const { unmount } = render(
            <ToastComponent 
              toast={{ ...defaultToast, type }} 
              onDismiss={mockOnDismiss} 
            />
          )
          
          const toast = screen.getByRole(type === 'error' ? 'alert' : 'status')
          expect(toast).toHaveClass(`toast-${type}`)
          
          unmount()
        })
      })

      it('should render without title', () => {
        const toastWithoutTitle = { ...defaultToast, title: undefined }
        render(<ToastComponent toast={toastWithoutTitle} onDismiss={mockOnDismiss} />)
        
        expect(screen.getByText('Test message')).toBeInTheDocument()
        expect(screen.queryByText('Test title')).not.toBeInTheDocument()
      })

      it('should render non-dismissible toast', () => {
        const nonDismissibleToast = { ...defaultToast, dismissible: false }
        render(<ToastComponent toast={nonDismissibleToast} onDismiss={mockOnDismiss} />)
        
        expect(screen.queryByRole('button', { name: /fechar/i })).not.toBeInTheDocument()
      })
    })

    describe('Interactive Features', () => {
      it('should handle dismiss button click', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
        await user.click(dismissButton)
        
        expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
      })

      it('should handle keyboard dismiss (Escape)', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        toast.focus()
        
        await user.keyboard('{Escape}')
        
        expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
      })

      it('should handle keyboard dismiss (Enter)', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        toast.focus()
        
        await user.keyboard('{Enter}')
        
        expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
      })

      it('should handle keyboard dismiss (Space)', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        toast.focus()
        
        await user.keyboard(' ')
        
        expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
      })
    })

    describe('Action Buttons', () => {
      it('should render and handle action buttons', async () => {
        const mockAction = jest.fn()
        const mockSecondaryAction = jest.fn()
        
        const toastWithActions: Toast = {
          ...defaultToast,
          action: {
            label: 'Primary Action',
            onClick: mockAction
          },
          secondaryAction: {
            label: 'Secondary Action',
            onClick: mockSecondaryAction
          }
        }
        
        render(<ToastComponent toast={toastWithActions} onDismiss={mockOnDismiss} />)
        
        const primaryButton = screen.getByRole('button', { name: 'Primary Action' })
        const secondaryButton = screen.getByRole('button', { name: 'Secondary Action' })
        
        expect(primaryButton).toBeInTheDocument()
        expect(secondaryButton).toBeInTheDocument()
        
        await user.click(primaryButton)
        await user.click(secondaryButton)
        
        expect(mockAction).toHaveBeenCalled()
        expect(mockSecondaryAction).toHaveBeenCalled()
      })
    })

    describe('Progress Bar', () => {
      it('should render progress bar', () => {
        const toastWithProgress: Toast = {
          ...defaultToast,
          progress: {
            current: 50,
            total: 100,
            label: 'Uploading'
          }
        }
        
        render(<ToastComponent toast={toastWithProgress} onDismiss={mockOnDismiss} />)
        
        expect(screen.getByText('Uploading')).toBeInTheDocument()
        expect(screen.getByText('50/100')).toBeInTheDocument()
        
        const progressBar = screen.getByRole('progressbar', { hidden: true })
        expect(progressBar).toHaveStyle({ width: '50%' })
      })
    })

    describe('Expandable Content', () => {
      it('should render and toggle expandable content', async () => {
        const toastWithExpandable: Toast = {
          ...defaultToast,
          expandable: {
            summary: 'Show details',
            details: 'Detailed information here'
          }
        }
        
        render(<ToastComponent toast={toastWithExpandable} onDismiss={mockOnDismiss} />)
        
        const toggleButton = screen.getByRole('button', { name: /show details/i })
        expect(toggleButton).toBeInTheDocument()
        expect(screen.queryByText('Detailed information here')).not.toBeInTheDocument()
        
        await user.click(toggleButton)
        
        expect(screen.getByText('Detailed information here')).toBeInTheDocument()
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
      })
    })

    describe('Copy Functionality', () => {
      it('should render copy button and handle copy action', async () => {
        const toastWithCopy: Toast = {
          ...defaultToast,
          copyable: {
            text: 'Text to copy',
            label: 'Copy Text'
          }
        }
        
        render(<ToastComponent toast={toastWithCopy} onDismiss={mockOnDismiss} />)
        
        const copyButton = screen.getByRole('button', { name: 'Copy Text' })
        expect(copyButton).toBeInTheDocument()
        
        await user.click(copyButton)
        
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Text to copy')
        
        await waitFor(() => {
          expect(screen.getByText('✓ Copiado!')).toBeInTheDocument()
        })
      })

      it('should handle copy failure gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        ;(navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Copy failed'))
        
        const toastWithCopy: Toast = {
          ...defaultToast,
          copyable: {
            text: 'Text to copy',
            label: 'Copy Text'
          }
        }
        
        render(<ToastComponent toast={toastWithCopy} onDismiss={mockOnDismiss} />)
        
        const copyButton = screen.getByRole('button', { name: 'Copy Text' })
        await user.click(copyButton)
        
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))
        
        consoleSpy.mockRestore()
      })
    })

    describe('Touch Gestures', () => {
      it('should handle touch swipe to dismiss', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        
        // Simulate touch swipe
        fireEvent.touchStart(toast, {
          touches: [{ clientX: 0, clientY: 0 }]
        })
        
        fireEvent.touchMove(toast, {
          touches: [{ clientX: 150, clientY: 0 }]
        })
        
        fireEvent.touchEnd(toast)
        
        expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
      })

      it('should not dismiss on small swipe', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        
        // Simulate small touch swipe
        fireEvent.touchStart(toast, {
          touches: [{ clientX: 0, clientY: 0 }]
        })
        
        fireEvent.touchMove(toast, {
          touches: [{ clientX: 50, clientY: 0 }]
        })
        
        fireEvent.touchEnd(toast)
        
        expect(mockOnDismiss).not.toHaveBeenCalled()
      })
    })

    describe('Auto-dismiss Timer', () => {
      it('should show progress bar for auto-dismiss', () => {
        const toastWithDuration: Toast = {
          ...defaultToast,
          duration: 5000
        }
        
        render(<ToastComponent toast={toastWithDuration} onDismiss={mockOnDismiss} />)
        
        const progressBar = screen.getByRole('progressbar', { hidden: true })
        expect(progressBar).toBeInTheDocument()
        expect(progressBar).toHaveStyle({ 
          animationDuration: '5000ms',
          animationPlayState: 'running'
        })
      })

      it('should pause progress bar on hover', () => {
        const toastWithDuration: Toast = {
          ...defaultToast,
          duration: 5000
        }
        
        render(<ToastComponent toast={toastWithDuration} onDismiss={mockOnDismiss} isPaused={true} />)
        
        const progressBar = screen.getByRole('progressbar', { hidden: true })
        expect(progressBar).toHaveStyle({ 
          animationPlayState: 'paused'
        })
      })
    })

    describe('Accessibility', () => {
      it('should have proper ARIA attributes', () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        expect(toast).toHaveAttribute('aria-live', 'polite')
        expect(toast).toHaveAttribute('aria-atomic', 'true')
        expect(toast).toHaveAttribute('aria-label')
      })

      it('should use alert role for error toasts', () => {
        const errorToast: Toast = { ...defaultToast, type: 'error' }
        render(<ToastComponent toast={errorToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('alert')
        expect(toast).toHaveAttribute('aria-live', 'assertive')
      })

      it('should be focusable when dismissible', () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        expect(toast).toHaveAttribute('tabIndex', '0')
      })

      it('should not be focusable when not dismissible', () => {
        const nonDismissibleToast: Toast = { ...defaultToast, dismissible: false }
        render(<ToastComponent toast={nonDismissibleToast} onDismiss={mockOnDismiss} />)
        
        const toast = screen.getByRole('status')
        expect(toast).toHaveAttribute('tabIndex', '-1')
      })

      it('should announce to screen readers', async () => {
        render(<ToastComponent toast={defaultToast} onDismiss={mockOnDismiss} />)
        
        await waitFor(() => {
          const announcement = screen.getByText(/info notification: test title\. test message/i)
          expect(announcement).toBeInTheDocument()
          expect(announcement).toHaveClass('sr-only')
        })
      })
    })
  })

  describe('Toast System Integration', () => {
    const renderToastSystem = () => {
      return render(
        <ToastProvider maxToasts={5} defaultDuration={3000}>
          <TestToastTrigger />
          <ToastContainer position="top-right" />
        </ToastProvider>
      )
    }

    it('should show and auto-dismiss toasts', async () => {
      renderToastSystem()
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      await user.click(successButton)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      
      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      })
    })

    it('should handle multiple toasts with stagger animation', async () => {
      renderToastSystem()
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      const errorButton = screen.getByRole('button', { name: 'Show Error' })
      
      await user.click(successButton)
      await user.click(errorButton)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
      
      const toasts = screen.getAllByRole('status')
      expect(toasts).toHaveLength(1) // Success toast
      
      const alerts = screen.getAllByRole('alert')
      expect(alerts).toHaveLength(1) // Error toast
    })

    it('should clear all toasts', async () => {
      renderToastSystem()
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      const errorButton = screen.getByRole('button', { name: 'Show Error' })
      const clearButton = screen.getByRole('button', { name: 'Clear All' })
      
      await user.click(successButton)
      await user.click(errorButton)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
      
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
        expect(screen.queryByText('Error message')).not.toBeInTheDocument()
      })
    })

    it('should show clear all button when multiple toasts exist', async () => {
      renderToastSystem()
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      const errorButton = screen.getByRole('button', { name: 'Show Error' })
      
      await user.click(successButton)
      await user.click(errorButton)
      
      expect(screen.getByRole('button', { name: /limpar todas/i })).toBeInTheDocument()
    })

    it('should handle keyboard shortcuts', async () => {
      renderToastSystem()
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      await user.click(successButton)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
      
      // Press Escape to dismiss
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
    })

    it('should adapt to mobile viewport', async () => {
      render(
        <ToastProvider>
          <TestToastTrigger />
          <ToastContainer position="top-right" />
        </ToastProvider>
      )
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      await user.click(successButton)
      
      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveAttribute('data-mobile', 'true')
    })
  })

  describe('Error Handling', () => {
    it('should handle animation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Mock animation error
      const originalAnimate = Element.prototype.animate
      Element.prototype.animate = jest.fn().mockImplementation(() => {
        throw new Error('Animation failed')
      })
      
      render(
        <ToastProvider>
          <TestToastTrigger />
          <ToastContainer position="top-right" />
        </ToastProvider>
      )
      
      const successButton = screen.getByRole('button', { name: 'Show Success' })
      await user.click(successButton)
      
      // Toast should still appear despite animation error
      expect(screen.getByText('Success message')).toBeInTheDocument()
      
      // Restore original animate method
      Element.prototype.animate = originalAnimate
      consoleSpy.mockRestore()
    })
  })
})