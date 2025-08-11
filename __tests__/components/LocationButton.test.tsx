import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LocationButton from '@/components/ui/LocationButton'

// Mock window.open
const mockWindowOpen = jest.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
})

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Mock navigator
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  maxTouchPoints: 0
}
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
})

// Mock gtag for analytics
const mockGtag = jest.fn()
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true
})

describe('LocationButton', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockWindowOpen.mockReturnValue({ focus: jest.fn() })
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('location-button')
      expect(button).toHaveAttribute('aria-describedby', 'location-button-description')
    })

    it('should render with custom children', () => {
      render(<LocationButton>Custom Location Text</LocationButton>)
      
      expect(screen.getByText('Custom Location Text')).toBeInTheDocument()
    })

    it('should render with different variants', () => {
      const { rerender } = render(<LocationButton variant="default" />)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-amber-600')

      rerender(<LocationButton variant="outline" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('border-2', 'border-amber-600')

      rerender(<LocationButton variant="secondary" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-amber-100')

      rerender(<LocationButton variant="ghost" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('text-amber-700')
    })

    it('should render with different sizes', () => {
      const { rerender } = render(<LocationButton size="sm" />)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-4', 'py-2')

      rerender(<LocationButton size="default" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'px-6', 'py-3')

      rerender(<LocationButton size="lg" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-12', 'px-8', 'py-4')
    })

    it('should render alternative service buttons on desktop', () => {
      // Mock large screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      expect(screen.getByRole('button', { name: /abrir no google maps/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /abrir no waze/i })).toBeInTheDocument()
    })

    it('should show Apple Maps button on Apple devices', () => {
      // Mock iOS user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      expect(screen.getByRole('button', { name: /abrir no apple maps/i })).toBeInTheDocument()
    })
  })
      button = screen.getByRole('button')
      expect(button).toHaveClass('border-amber-600')

      rerender(<LocationButton variant="secondary" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-amber-100')
    })

    it('should render with different sizes', () => {
      const { rerender } = render(<LocationButton size="sm" />)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')

      rerender(<LocationButton size="lg" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-12')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <LocationButton 
          address="Test Address"
          coordinates={{ lat: -22.9068, lng: -43.1729 }}
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Ver localização: Test Address')
      expect(button).toHaveAttribute('aria-describedby', 'location-button-description')
    })

    it('should have screen reader description', () => {
      render(<LocationButton />)
      
      const description = screen.getByText('Clique para abrir a localização em seu aplicativo de mapas preferido')
      expect(description).toHaveClass('sr-only')
    })

    it('should be keyboard accessible', () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have proper focus styles', () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('Functionality', () => {
    it('should call custom onClick when provided', () => {
      const mockOnClick = jest.fn()
      render(<LocationButton onClick={mockOnClick} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('should open Google Maps by default on desktop', () => {
      render(<LocationButton coordinates={{ lat: -22.9068, lng: -43.1729 }} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=-22.9068,-43.1729',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should show loading state when clicked', async () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(button).toHaveAttribute('aria-label', 'Abrindo localização...')
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should handle popup blocked error gracefully', () => {
      mockWindowOpen.mockReturnValue(null) // Simulate blocked popup
      
      render(<LocationButton address="Test Address" />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      // Should try fallback URL
      expect(mockWindowOpen).toHaveBeenCalledTimes(2)
    })
  })

  describe('Service Buttons', () => {
    it('should render Google Maps and Waze buttons on desktop', () => {
      render(<LocationButton />)
      
      expect(screen.getByText('Google Maps')).toBeInTheDocument()
      expect(screen.getByText('Waze')).toBeInTheDocument()
    })

    it('should open Google Maps when Google button is clicked', () => {
      render(<LocationButton coordinates={{ lat: -22.9068, lng: -43.1729 }} />)
      
      const googleButton = screen.getByLabelText('Abrir no Google Maps')
      fireEvent.click(googleButton)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=-22.9068,-43.1729',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should open Waze when Waze button is clicked', () => {
      render(<LocationButton coordinates={{ lat: -22.9068, lng: -43.1729 }} />)
      
      const wazeButton = screen.getByLabelText('Abrir no Waze')
      fireEvent.click(wazeButton)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://waze.com/ul?ll=-22.9068,-43.1729&navigate=yes',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should show loading state for individual services', async () => {
      render(<LocationButton />)
      
      const googleButton = screen.getByLabelText('Abrir no Google Maps')
      fireEvent.click(googleButton)
      
      expect(googleButton).toBeDisabled()
      // Should show loading spinner in Google button
    })
  })

  describe('User Preferences', () => {
    it('should save user preference when service is used', () => {
      render(<LocationButton />)
      
      const wazeButton = screen.getByLabelText('Abrir no Waze')
      fireEvent.click(wazeButton)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('map-service-preference', 'waze')
    })

    it('should load saved user preference', () => {
      mockLocalStorage.getItem.mockReturnValue('waze')
      
      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      fireEvent.click(button)
      
      // Should use Waze based on saved preference
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('waze.com'),
        '_blank',
        'noopener,noreferrer'
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle failed services gracefully', () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Service unavailable')
      })
      
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should show error state for failed services', async () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Service unavailable')
      })
      
      render(<LocationButton />)
      
      const googleButton = screen.getByLabelText('Abrir no Google Maps')
      fireEvent.click(googleButton)
      
      await waitFor(() => {
        expect(googleButton).toHaveAttribute('aria-label', 'Google Maps indisponível')
      })
    })
  })

  describe('Responsive Design', () => {
    it('should hide service buttons on mobile', () => {
      render(<LocationButton />)
      
      const serviceButtons = screen.getByRole('group', { name: /opções de aplicativos de mapa/i })
      expect(serviceButtons).toHaveClass('hidden', 'lg:flex')
    })
  })

  describe('Performance', () => {
    it('should memoize map URLs', () => {
      const { rerender } = render(
        <LocationButton coordinates={{ lat: -22.9068, lng: -43.1729 }} />
      )
      
      // Re-render with same coordinates
      rerender(<LocationButton coordinates={{ lat: -22.9068, lng: -43.1729 }} />)
      
      // URLs should be memoized and not recalculated
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(mockWindowOpen).toHaveBeenCalledTimes(1)
    })
  })
})  d
escribe('Functionality', () => {
    it('should open Google Maps when main button is clicked', async () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          expect.stringContaining('google.com/maps'),
          '_blank',
          'noopener,noreferrer'
        )
      })
    })

    it('should open Google Maps directly when Google Maps button is clicked', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const googleButton = screen.getByRole('button', { name: /abrir no google maps/i })
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          expect.stringContaining('google.com/maps'),
          '_blank',
          'noopener,noreferrer'
        )
      })
    })

    it('should open Waze when Waze button is clicked', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const wazeButton = screen.getByRole('button', { name: /abrir no waze/i })
      await user.click(wazeButton)
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          expect.stringContaining('waze.com'),
          '_blank',
          'noopener,noreferrer'
        )
      })
    })

    it('should save user preference when service is used', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const wazeButton = screen.getByRole('button', { name: /abrir no waze/i })
      await user.click(wazeButton)
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('map-service-preference', 'waze')
      })
    })

    it('should load saved user preference', () => {
      mockLocalStorage.getItem.mockReturnValue('waze')
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const wazeButton = screen.getByRole('button', { name: /abrir no waze/i })
      expect(wazeButton).toHaveClass('ring-2', 'ring-cyan-300')
    })

    it('should handle custom onClick prop', async () => {
      const mockOnClick = jest.fn()
      render(<LocationButton onClick={mockOnClick} />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      await user.click(button)
      
      expect(mockOnClick).toHaveBeenCalled()
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('should show loading state when clicked', async () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      
      await act(async () => {
        await user.click(button)
      })
      
      expect(button).toHaveAttribute('aria-label', 'Abrindo localização...')
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should handle popup blocker', async () => {
      mockWindowOpen.mockReturnValue(null)
      
      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      await user.click(button)
      
      // Should still attempt to open
      expect(mockWindowOpen).toHaveBeenCalled()
    })

    it('should fallback to alternative service when primary fails', async () => {
      mockWindowOpen.mockImplementationOnce(() => {
        throw new Error('Popup blocked')
      }).mockReturnValueOnce({ focus: jest.fn() })
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledTimes(2)
      })
    })

    it('should show failed service indicator', async () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Service unavailable')
      })
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const googleButton = screen.getByRole('button', { name: /abrir no google maps/i })
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(googleButton).toHaveAttribute('aria-label', 'Google Maps indisponível')
        expect(googleButton).toHaveAttribute('title', 'Serviço temporariamente indisponível')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button).toHaveAttribute('aria-describedby')
      
      const description = screen.getByText(/clique para abrir a localização/i)
      expect(description).toHaveClass('sr-only')
    })

    it('should support keyboard navigation', async () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      
      // Focus the button
      button.focus()
      expect(button).toHaveFocus()
      
      // Press Enter
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled()
      })
    })

    it('should support space key activation', async () => {
      render(<LocationButton />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled()
      })
    })

    it('should have proper focus management', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex')
      })
    })
  })

  describe('Platform Detection', () => {
    it('should detect iOS platform', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })

      render(<LocationButton />)
      
      // Should prefer Apple Maps on iOS
      const button = screen.getByRole('button', { name: /ver localização/i })
      expect(button).toBeInTheDocument()
    })

    it('should detect Android platform', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
      })

      render(<LocationButton />)
      
      // Should prefer Google Maps on Android
      const button = screen.getByRole('button', { name: /ver localização/i })
      expect(button).toBeInTheDocument()
    })

    it('should detect macOS platform', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      })

      render(<LocationButton />)
      
      const button = screen.getByRole('button', { name: /ver localização/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Analytics', () => {
    it('should track map service usage', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      render(<LocationButton />)
      
      const wazeButton = screen.getByRole('button', { name: /abrir no waze/i })
      await user.click(wazeButton)
      
      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('event', 'map_service_used', {
          service: 'waze',
          platform: expect.any(String)
        })
      })
    })
  })

  describe('Performance', () => {
    it('should preload DNS for map services', () => {
      render(<LocationButton />)
      
      // Check if DNS prefetch links are added
      const links = document.querySelectorAll('link[rel="dns-prefetch"]')
      const hrefs = Array.from(links).map(link => link.getAttribute('href'))
      
      expect(hrefs).toContain('https://www.google.com')
      expect(hrefs).toContain('https://maps.google.com')
      expect(hrefs).toContain('https://waze.com')
      expect(hrefs).toContain('https://maps.apple.com')
    })

    it('should cleanup DNS prefetch links on unmount', () => {
      const { unmount } = render(<LocationButton />)
      
      const initialLinks = document.querySelectorAll('link[rel="dns-prefetch"]').length
      
      unmount()
      
      const finalLinks = document.querySelectorAll('link[rel="dns-prefetch"]').length
      expect(finalLinks).toBeLessThan(initialLinks)
    })
  })
})