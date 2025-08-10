import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react'
import { ToastProvider } from '@/contexts/ToastContext'
import { useToastNotifications } from '@/hooks/useToastNotifications'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('useToastNotifications', () => {
  describe('Basic Toast Methods', () => {
    it('should provide showSuccess method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.showSuccess).toBe('function')
      
      const toastId = result.current.showSuccess('Success message', 'Success Title')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showError method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.showError).toBe('function')
      
      const toastId = result.current.showError('Error message', 'Error Title')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showWarning method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.showWarning).toBe('function')
      
      const toastId = result.current.showWarning('Warning message', 'Warning Title')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showInfo method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.showInfo).toBe('function')
      
      const toastId = result.current.showInfo('Info message', 'Info Title')
      expect(typeof toastId).toBe('string')
    })
  })

  describe('Specialized Toast Methods', () => {
    it('should provide showLoadingToast method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showLoadingToast('Loading...')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showLocationSuccess method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showLocationSuccess()
      expect(typeof toastId).toBe('string')
    })

    it('should provide showLocationError method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showLocationError()
      expect(typeof toastId).toBe('string')
    })

    it('should provide showNetworkError method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showNetworkError()
      expect(typeof toastId).toBe('string')
    })

    it('should provide showValidationError method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showValidationError('Validation failed')
      expect(typeof toastId).toBe('string')
    })
  })

  describe('Interactive Toast Methods', () => {
    it('should provide showProgressToast method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showProgressToast(50, 100, 'Uploading...', 'Upload')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showExpandableError method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showExpandableError('Error summary', 'Detailed error information')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showCopyableInfo method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showCopyableInfo('Info message', 'Text to copy')
      expect(typeof toastId).toBe('string')
    })

    it('should provide showPersistentWarning method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      const toastId = result.current.showPersistentWarning('Important warning')
      expect(typeof toastId).toBe('string')
    })
  })

  describe('Toast State Management', () => {
    it('should provide access to toasts array', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(Array.isArray(result.current.toasts)).toBe(true)
      expect(result.current.toasts).toHaveLength(0)
    })

    it('should provide removeToast method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.removeToast).toBe('function')
    })

    it('should provide clearToasts method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.clearToasts).toBe('function')
    })

    it('should provide updateToast method', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      expect(typeof result.current.updateToast).toBe('function')
    })
  })

  describe('Integration with ToastContext', () => {
    it('should work with ToastProvider', () => {
      function TestComponent() {
        const { showSuccess, toasts } = useToastNotifications()
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button 
              onClick={() => showSuccess('Test success')}
              data-testid="add-success"
            >
              Add Success
            </button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      
      fireEvent.click(screen.getByTestId('add-success'))
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })

    it('should throw error when used outside ToastProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        renderHook(() => useToastNotifications())
      }).toThrow('useToast must be used within a ToastProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Default Options', () => {
    it('should use appropriate durations for different toast types', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      // Success toasts should have shorter duration
      result.current.showSuccess('Success')
      expect(result.current.toasts[0].duration).toBe(4000)
      
      // Error toasts should have longer duration
      result.current.showError('Error')
      expect(result.current.toasts[1].duration).toBe(6000)
      
      // Warning toasts should have medium duration
      result.current.showWarning('Warning')
      expect(result.current.toasts[2].duration).toBe(5000)
    })

    it('should set appropriate dismissible states', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      // Loading toasts should not be dismissible
      result.current.showLoadingToast('Loading...')
      expect(result.current.toasts[0].dismissible).toBe(false)
      
      // Regular toasts should be dismissible
      result.current.showSuccess('Success')
      expect(result.current.toasts[1].dismissible).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      // Should not throw when called with valid parameters
      expect(() => {
        result.current.showSuccess('Test')
        result.current.showError('Test')
        result.current.showWarning('Test')
        result.current.showInfo('Test')
      }).not.toThrow()
    })

    it('should handle empty or undefined parameters', () => {
      const { result } = renderHook(() => useToastNotifications(), { wrapper })
      
      // Should handle empty strings
      expect(() => {
        result.current.showSuccess('')
        result.current.showError('', '')
      }).not.toThrow()
    })
  })
})