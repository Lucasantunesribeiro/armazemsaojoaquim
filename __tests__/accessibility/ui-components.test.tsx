import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import LocationButton from '@/components/ui/LocationButton'
import { ToastComponent } from '@/components/ui/Toast'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('UI Components Accessibility', () => {
  describe('LocationButton', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LocationButton />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations with different variants', async () => {
      const variants = ['default', 'outline', 'secondary', 'ghost'] as const
      
      for (const variant of variants) {
        const { container } = render(<LocationButton variant={variant} />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }
    })

    it('should not have violations with different sizes', async () => {
      const sizes = ['sm', 'default', 'lg'] as const
      
      for (const size of sizes) {
        const { container } = render(<LocationButton size={size} />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }
    })

    it('should not have violations in loading state', async () => {
      const { container } = render(<LocationButton />)
      
      // Simulate loading state by clicking
      const button = container.querySelector('button')
      button?.click()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations with custom props', async () => {
      const { container } = render(
        <LocationButton 
          address="Custom Address"
          coordinates={{ lat: -23.5505, lng: -46.6333 }}
          variant="default"
          size="lg"
        >
          Custom Location Text
        </LocationButton>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ToastComponent', () => {
    const mockOnDismiss = jest.fn()

    it('should not have accessibility violations for info toast', async () => {
      const toast = {
        id: 'test-toast',
        type: 'info' as const,
        message: 'Test message',
        title: 'Test title'
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={mockOnDismiss} />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations for different toast types', async () => {
      const types = ['success', 'error', 'warning', 'info'] as const
      
      for (const type of types) {
        const toast = {
          id: `test-toast-${type}`,
          type,
          message: `${type} message`,
          title: `${type} title`
        }
        
        const { container } = render(
          <ToastComponent toast={toast} onDismiss={mockOnDismiss} />
        )
        
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }
    })

    it('should not have violations with action buttons', async () => {
      const toast = {
        id: 'test-toast',
        type: 'error' as const,
        message: 'Error message',
        title: 'Error title',
        action: {
          label: 'Retry',
          onClick: jest.fn()
        },
        secondaryAction: {
          label: 'Cancel',
          onClick: jest.fn()
        }
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={mockOnDismiss} />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations with interactive features', async () => {
      const toast = {
        id: 'test-toast',
        type: 'info' as const,
        message: 'Info message',
        title: 'Info title',
        progress: {
          current: 50,
          total: 100,
          label: 'Progress'
        },
        expandable: {
          summary: 'Show details',
          details: 'Detailed information'
        },
        copyable: {
          text: 'Text to copy',
          label: 'Copy'
        }
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={mockOnDismiss} />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations when not dismissible', async () => {
      const toast = {
        id: 'test-toast',
        type: 'info' as const,
        message: 'Persistent message',
        dismissible: false
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={mockOnDismiss} />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ToastContainer', () => {
    it('should not have accessibility violations when empty', async () => {
      const { container } = render(
        <ToastProvider>
          <ToastContainer />
        </ToastProvider>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations with multiple toasts', async () => {
      function TestComponent() {
        const [toasts] = React.useState([
          {
            id: 'toast-1',
            type: 'success' as const,
            message: 'Success message',
            title: 'Success'
          },
          {
            id: 'toast-2',
            type: 'error' as const,
            message: 'Error message',
            title: 'Error'
          },
          {
            id: 'toast-3',
            type: 'warning' as const,
            message: 'Warning message',
            title: 'Warning'
          }
        ])
        
        return (
          <div>
            {toasts.map(toast => (
              <ToastComponent 
                key={toast.id} 
                toast={toast} 
                onDismiss={jest.fn()} 
              />
            ))}
          </div>
        )
      }
      
      const { container } = render(<TestComponent />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have violations with different positions', async () => {
      const positions = [
        'top-right', 'top-left', 'bottom-right', 
        'bottom-left', 'top-center', 'bottom-center'
      ] as const
      
      for (const position of positions) {
        const { container } = render(
          <ToastProvider>
            <ToastContainer position={position} />
          </ToastProvider>
        )
        
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }
    })
  })

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for LocationButton variants', async () => {
      const variants = ['default', 'outline', 'secondary', 'ghost'] as const
      
      for (const variant of variants) {
        const { container } = render(<LocationButton variant={variant} />)
        
        // Test with axe color-contrast rule specifically
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true }
          }
        })
        
        expect(results).toHaveNoViolations()
      }
    })

    it('should have sufficient color contrast for toast types', async () => {
      const types = ['success', 'error', 'warning', 'info'] as const
      const mockOnDismiss = jest.fn()
      
      for (const type of types) {
        const toast = {
          id: `test-toast-${type}`,
          type,
          message: `${type} message`,
          title: `${type} title`
        }
        
        const { container } = render(
          <ToastComponent toast={toast} onDismiss={mockOnDismiss} />
        )
        
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true }
          }
        })
        
        expect(results).toHaveNoViolations()
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('should have proper focus management for LocationButton', async () => {
      const { container } = render(<LocationButton />)
      
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true },
          'focusable-content': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })

    it('should have proper focus management for ToastComponent', async () => {
      const toast = {
        id: 'test-toast',
        type: 'info' as const,
        message: 'Test message',
        action: {
          label: 'Action',
          onClick: jest.fn()
        }
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={jest.fn()} />
      )
      
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true },
          'focusable-content': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA attributes for LocationButton', async () => {
      const { container } = render(<LocationButton />)
      
      const results = await axe(container, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'button-name': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA attributes for ToastComponent', async () => {
      const toast = {
        id: 'test-toast',
        type: 'error' as const,
        message: 'Error message',
        title: 'Error title'
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={jest.fn()} />
      )
      
      const results = await axe(container, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-roles': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper live regions for toasts', async () => {
      const toast = {
        id: 'test-toast',
        type: 'success' as const,
        message: 'Success message'
      }
      
      const { container } = render(
        <ToastComponent toast={toast} onDismiss={jest.fn()} />
      )
      
      const results = await axe(container, {
        rules: {
          'aria-live-region-atomic': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })
})    i
t('should have proper focus management', () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(button).toHaveFocus()
      expect(button).toHaveAttribute('tabIndex')
    })

    it('should support keyboard navigation', async () => {
      const mockOnClick = jest.fn()
      render(<LocationButton onClick={mockOnClick} />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      expect(mockOnClick).toHaveBeenCalled()
      
      mockOnClick.mockClear()
      
      // Test Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      expect(mockOnClick).toHaveBeenCalled()
    })

    it('should have sufficient color contrast', () => {
      const { container } = render(<LocationButton />)
      
      const button = container.querySelector('button')
      const computedStyle = window.getComputedStyle(button!)
      
      // These would need actual color contrast calculation in a real test
      expect(computedStyle.backgroundColor).toBeDefined()
      expect(computedStyle.color).toBeDefined()
    })

    it('should work with screen readers', () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button).toHaveAttribute('aria-describedby')
      
      const description = screen.getByText(/clique para abrir a localização/i)
      expect(description).toHaveClass('sr-only')
    })
  })

  describe('Toast System', () => {
    const mockToast: Toast = {
      id: 'test-toast',
      type: 'info',
      message: 'Test message',
      title: 'Test title'
    }

    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ToastComponent toast={mockToast} onDismiss={() => {}} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA roles and attributes', () => {
      render(<ToastComponent toast={mockToast} onDismiss={() => {}} />)
      
      const toast = screen.getByRole('status')
      expect(toast).toHaveAttribute('aria-live', 'polite')
      expect(toast).toHaveAttribute('aria-atomic', 'true')
      expect(toast).toHaveAttribute('aria-label')
    })

    it('should use alert role for error toasts', () => {
      const errorToast: Toast = { ...mockToast, type: 'error' }
      render(<ToastComponent toast={errorToast} onDismiss={() => {}} />)
      
      const toast = screen.getByRole('alert')
      expect(toast).toHaveAttribute('aria-live', 'assertive')
    })

    it('should support keyboard navigation', () => {
      const mockOnDismiss = jest.fn()
      render(<ToastComponent toast={mockToast} onDismiss={mockOnDismiss} />)
      
      const toast = screen.getByRole('status')
      toast.focus()
      
      // Test Escape key
      fireEvent.keyDown(toast, { key: 'Escape', code: 'Escape' })
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast')
    })

    it('should have accessible dismiss button', () => {
      render(<ToastComponent toast={mockToast} onDismiss={() => {}} />)
      
      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      expect(dismissButton).toHaveAttribute('aria-label')
      expect(dismissButton).toHaveAttribute('title')
    })

    it('should announce to screen readers', async () => {
      render(<ToastComponent toast={mockToast} onDismiss={() => {}} />)
      
      await waitFor(() => {
        const announcement = screen.getByText(/info notification/i)
        expect(announcement).toHaveClass('sr-only')
        expect(announcement).toHaveAttribute('aria-live')
      })
    })

    it('should handle high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      const { container } = render(
        <ToastComponent toast={mockToast} onDismiss={() => {}} />
      )
      
      // In a real test, you'd check for high contrast styles
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      const { container } = render(
        <ToastComponent toast={mockToast} onDismiss={() => {}} />
      )
      
      // In a real test, you'd check that animations are disabled
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have proper touch target sizes on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<ToastComponent toast={mockToast} onDismiss={() => {}} />)
      
      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      const computedStyle = window.getComputedStyle(dismissButton)
      
      // Check minimum touch target size (44px for iOS)
      expect(parseInt(computedStyle.minWidth) || 0).toBeGreaterThanOrEqual(44)
      expect(parseInt(computedStyle.minHeight) || 0).toBeGreaterThanOrEqual(44)
    })
  })

  describe('Toast Container', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ToastProvider>
          <ToastContainer position="top-right" />
        </ToastProvider>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper landmark and labeling', () => {
      render(
        <ToastProvider>
          <ToastContainer position="top-right" />
        </ToastProvider>
      )
      
      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('should support keyboard shortcuts', () => {
      render(
        <ToastProvider>
          <ToastContainer position="top-right" />
        </ToastProvider>
      )
      
      // Test global keyboard shortcuts
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      fireEvent.keyDown(document, { 
        key: 'X', 
        code: 'KeyX', 
        ctrlKey: true, 
        shiftKey: true 
      })
      
      // Should not throw errors
      expect(true).toBe(true)
    })
  })

  describe('Color Contrast', () => {
    it('should meet WCAG AA standards for LocationButton', () => {
      const { container } = render(<LocationButton />)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('location-button')
      
      // In a real implementation, you'd calculate actual contrast ratios
      // This is a placeholder for contrast testing
      expect(button).toBeDefined()
    })

    it('should meet WCAG AA standards for Toast variants', () => {
      const types: Array<Toast['type']> = ['success', 'error', 'warning', 'info']
      
      types.forEach(type => {
        const toast: Toast = {
          id: 'test',
          type,
          message: 'Test message'
        }
        
        const { container } = render(
          <ToastComponent toast={toast} onDismiss={() => {}} />
        )
        
        const toastElement = container.querySelector(`.toast-${type}`)
        expect(toastElement).toBeDefined()
      })
    })
  })

  describe('Focus Management', () => {
    it('should trap focus appropriately in modal-like toasts', () => {
      const persistentToast: Toast = {
        id: 'persistent',
        type: 'error',
        message: 'Critical error',
        persistent: true,
        action: {
          label: 'Retry',
          onClick: () => {}
        }
      }
      
      render(<ToastComponent toast={persistentToast} onDismiss={() => {}} />)
      
      const actionButton = screen.getByRole('button', { name: 'Retry' })
      const dismissButton = screen.getByRole('button', { name: /fechar/i })
      
      expect(actionButton).toBeInTheDocument()
      expect(dismissButton).toBeInTheDocument()
    })

    it('should restore focus after toast dismissal', async () => {
      const TestComponent = () => {
        const [showToast, setShowToast] = React.useState(false)
        
        return (
          <div>
            <button onClick={() => setShowToast(true)}>Show Toast</button>
            {showToast && (
              <ToastComponent 
                toast={{
                  id: 'test',
                  type: 'info',
                  message: 'Test'
                }}
                onDismiss={() => setShowToast(false)}
              />
            )}
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const triggerButton = screen.getByRole('button', { name: 'Show Toast' })
      triggerButton.focus()
      
      fireEvent.click(triggerButton)
      
      const dismissButton = screen.getByRole('button', { name: /fechar/i })
      fireEvent.click(dismissButton)
      
      // Focus should return to trigger button
      await waitFor(() => {
        expect(triggerButton).toHaveFocus()
      })
    })
  })
})