import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastProvider, useToast } from '@/contexts/ToastContext'

// Test component to interact with ToastContext
function TestComponent() {
  const { toasts, addToast, removeToast, clearToasts, updateToast } = useToast()
  
  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="toasts">
        {toasts.map(toast => (
          <div key={toast.id} data-testid={`toast-${toast.id}`}>
            {toast.type}: {toast.message}
          </div>
        ))}
      </div>
      <button 
        onClick={() => addToast({ type: 'info', message: 'Test message' })}
        data-testid="add-toast"
      >
        Add Toast
      </button>
      <button 
        onClick={() => addToast({ type: 'success', message: 'Success message', title: 'Success' })}
        data-testid="add-success-toast"
      >
        Add Success Toast
      </button>
      <button 
        onClick={() => clearToasts()}
        data-testid="clear-toasts"
      >
        Clear Toasts
      </button>
      <button 
        onClick={() => {
          if (toasts.length > 0) {
            removeToast(toasts[0].id)
          }
        }}
        data-testid="remove-first-toast"
      >
        Remove First Toast
      </button>
      <button 
        onClick={() => {
          if (toasts.length > 0) {
            updateToast(toasts[0].id, { message: 'Updated message' })
          }
        }}
        data-testid="update-first-toast"
      >
        Update First Toast
      </button>
    </div>
  )
}

describe('ToastContext', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Provider Setup', () => {
    it('should provide toast context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      expect(screen.getByTestId('add-toast')).toBeInTheDocument()
    })

    it('should throw error when useToast is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useToast must be used within a ToastProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Adding Toasts', () => {
    it('should add toast to the list', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('info: Test message')).toBeInTheDocument()
    })

    it('should generate unique IDs for toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      fireEvent.click(screen.getByTestId('add-toast'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
      
      const toasts = screen.getByTestId('toasts')
      const toastElements = toasts.querySelectorAll('[data-testid^="toast-"]')
      expect(toastElements).toHaveLength(2)
      
      // IDs should be different
      const ids = Array.from(toastElements).map(el => el.getAttribute('data-testid'))
      expect(ids[0]).not.toBe(ids[1])
    })

    it('should respect maxToasts limit', () => {
      render(
        <ToastProvider maxToasts={2}>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add 3 toasts
      fireEvent.click(screen.getByTestId('add-toast'))
      fireEvent.click(screen.getByTestId('add-toast'))
      fireEvent.click(screen.getByTestId('add-toast'))
      
      // Should only have 2 toasts (oldest removed)
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
    })

    it('should set default duration and dismissible properties', () => {
      render(
        <ToastProvider defaultDuration={3000}>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      
      // Toast should auto-remove after default duration
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  describe('Removing Toasts', () => {
    it('should remove specific toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      fireEvent.click(screen.getByTestId('add-success-toast'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
      
      fireEvent.click(screen.getByTestId('remove-first-toast'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('success: Success message')).toBeInTheDocument()
    })

    it('should clear all toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      fireEvent.click(screen.getByTestId('add-success-toast'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')
      
      fireEvent.click(screen.getByTestId('clear-toasts'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })

    it('should clear timeouts when removing toasts', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      
      render(
        <ToastProvider defaultDuration={5000}>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      fireEvent.click(screen.getByTestId('remove-first-toast'))
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      clearTimeoutSpy.mockRestore()
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss toast after duration', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      
      // Default duration is 5000ms
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })

    it('should not auto-dismiss when duration is 0', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Manually add toast with duration 0
      const { toasts, addToast } = useToast()
      act(() => {
        addToast({ type: 'info', message: 'Persistent toast', duration: 0 })
      })
      
      act(() => {
        jest.advanceTimersByTime(10000)
      })
      
      // Toast should still be there
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })

    it('should respect custom duration', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Add toast with custom duration
      const TestComponentWithCustomDuration = () => {
        const { addToast } = useToast()
        return (
          <button 
            onClick={() => addToast({ type: 'info', message: 'Custom duration', duration: 2000 })}
            data-testid="add-custom-toast"
          >
            Add Custom Toast
          </button>
        )
      }
      
      render(<TestComponentWithCustomDuration />)
      
      fireEvent.click(screen.getByTestId('add-custom-toast'))
      
      // Should dismiss after 2000ms
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  describe('Updating Toasts', () => {
    it('should update toast properties', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      expect(screen.getByText('info: Test message')).toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('update-first-toast'))
      expect(screen.getByText('info: Updated message')).toBeInTheDocument()
    })

    it('should not update non-existent toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      const TestComponentWithUpdate = () => {
        const { updateToast } = useToast()
        return (
          <button 
            onClick={() => updateToast('non-existent-id', { message: 'Updated' })}
            data-testid="update-non-existent"
          >
            Update Non-existent
          </button>
        )
      }
      
      render(<TestComponentWithUpdate />)
      
      // Should not crash
      fireEvent.click(screen.getByTestId('update-non-existent'))
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in addToast gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Mock a scenario where setState throws
      const OriginalToastProvider = ToastProvider
      const ErrorToastProvider = ({ children }: { children: React.ReactNode }) => {
        const [errorCount, setErrorCount] = React.useState(0)
        
        if (errorCount > 2) {
          throw new Error('Toast system error')
        }
        
        return (
          <OriginalToastProvider>
            {children}
            <button 
              onClick={() => setErrorCount(prev => prev + 1)}
              data-testid="trigger-error"
            >
              Trigger Error
            </button>
          </OriginalToastProvider>
        )
      }
      
      render(
        <ErrorToastProvider>
          <TestComponent />
        </ErrorToastProvider>
      )
      
      // This should not crash the app
      fireEvent.click(screen.getByTestId('add-toast'))
      
      consoleSpy.mockRestore()
    })

    it('should show error state when toast system fails', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      // Simulate multiple errors to trigger error state
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Force multiple errors
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId('add-toast'))
      }
      
      await waitFor(() => {
        expect(screen.getByText(/sistema de notificações com problemas/i)).toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup timeouts on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      
      const { unmount } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )
      
      fireEvent.click(screen.getByTestId('add-toast'))
      
      unmount()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      clearTimeoutSpy.mockRestore()
    })
  })
})