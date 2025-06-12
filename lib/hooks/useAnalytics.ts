import { useEffect, useCallback } from 'react'
import { useSupabase } from '../../components/providers/SupabaseProvider'

// Tipos para eventos de analytics
interface ReservationEvent {
  action: 'reservation_started' | 'reservation_completed' | 'reservation_cancelled' | 'reservation_confirmed'
  reservationId?: string
  date?: string
  time?: string
  guests?: number
  duration?: number
}

interface PageViewEvent {
  page: string
  title: string
  referrer?: string
  duration?: number
}

interface UserInteractionEvent {
  action: 'button_click' | 'form_submit' | 'menu_view' | 'blog_read' | 'contact_form'
  element: string
  category: string
  value?: number
}

interface BusinessEvent {
  action: 'menu_item_viewed' | 'availability_checked' | 'newsletter_signup' | 'contact_submitted'
  details?: any
}

// Types já declarados em types/global.d.ts

export function useAnalytics() {
  const { user } = useSupabase()

  // Configurar Google Analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Configurar user ID se disponível
      if (user?.id && process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          user_id: user.id,
          custom_map: {
            custom_1: 'user_type'
          }
        })
      }
    }
  }, [user])

  // Track page views
  const trackPageView = useCallback((event: PageViewEvent) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: event.title,
        page_location: window.location.href,
        page_path: event.page,
        custom_referrer: event.referrer
      })
    }

    // Custom tracking para analytics próprio
    trackCustomEvent('page_view', {
      page: event.page,
      title: event.title,
      referrer: event.referrer,
      user_id: user?.id,
      timestamp: new Date().toISOString()
    })
  }, [user?.id])

  // Track reservation events
  const trackReservation = useCallback((event: ReservationEvent) => {
    const eventData = {
      event_category: 'Reservations',
      event_label: event.action,
      value: event.guests || 1,
      custom_parameter_1: event.date,
      custom_parameter_2: event.time,
      user_id: user?.id
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, eventData)
    }

    // Eventos específicos de negócio
    switch (event.action) {
      case 'reservation_started':
        trackCustomEvent('reservation_flow_started', {
          date: event.date,
          time: event.time,
          guests: event.guests,
          user_id: user?.id
        })
        break
      
      case 'reservation_completed':
        trackCustomEvent('reservation_completed', {
          reservation_id: event.reservationId,
          date: event.date,
          time: event.time,
          guests: event.guests,
          duration: event.duration,
          user_id: user?.id
        })
        break
      
      case 'reservation_confirmed':
        trackCustomEvent('reservation_confirmed', {
          reservation_id: event.reservationId,
          user_id: user?.id
        })
        break
    }
  }, [user?.id])

  // Track user interactions
  const trackInteraction = useCallback((event: UserInteractionEvent) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.element,
        value: event.value,
        user_id: user?.id
      })
    }

    trackCustomEvent('user_interaction', {
      action: event.action,
      element: event.element,
      category: event.category,
      value: event.value,
      user_id: user?.id
    })
  }, [user?.id])

  // Track business events
  const trackBusinessEvent = useCallback((event: BusinessEvent) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: 'Business',
        user_id: user?.id,
        ...event.details
      })
    }

    trackCustomEvent('business_event', {
      action: event.action,
      details: event.details,
      user_id: user?.id
    })
  }, [user?.id])

  // Track conversion events
  const trackConversion = useCallback((conversionType: string, value?: number) => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        event_category: 'Conversions',
        event_label: conversionType,
        value: value,
        user_id: user?.id
      })
    }

    trackCustomEvent('conversion', {
      type: conversionType,
      value: value,
      user_id: user?.id
    })
  }, [user?.id])

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_context: context,
        user_id: user?.id
      })
    }

    trackCustomEvent('error', {
      message: error.message,
      stack: error.stack,
      context: context,
      user_id: user?.id
    })
  }, [user?.id])

  // Track performance metrics
  const trackPerformance = useCallback((metric: string, value: number, unit?: string) => {
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: metric,
        value: value,
        event_category: 'Performance',
        unit: unit
      })
    }

    trackCustomEvent('performance', {
      metric: metric,
      value: value,
      unit: unit,
      timestamp: Date.now()
    })
  }, [])

  // Função auxiliar para tracking customizado
  const trackCustomEvent = useCallback(async (eventType: string, data: any) => {
    try {
      // Enviar para endpoint interno de analytics
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          data: data,
          timestamp: new Date().toISOString(),
          session_id: sessionStorage.getItem('session_id') || generateSessionId(),
          user_agent: navigator.userAgent,
          page_url: window.location.href
        })
      })
    } catch (error) {
      console.error('Erro ao enviar evento de analytics:', error)
    }
  }, [])

  // Generate session ID
  const generateSessionId = useCallback(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
    return sessionId
  }, [])

  // Track session start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionId = sessionStorage.getItem('session_id') || generateSessionId()
      
      trackCustomEvent('session_start', {
        session_id: sessionId,
        user_id: user?.id,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      })
    }
  }, [user?.id, generateSessionId, trackCustomEvent])

  // Utility functions for common tracking scenarios
  const trackMenuView = useCallback((category: string, itemName?: string) => {
    trackInteraction({
      action: 'menu_view',
      element: itemName || 'category',
      category: 'Menu',
      value: category === 'all' ? 0 : 1
    })
  }, [trackInteraction])

  const trackBlogRead = useCallback((slug: string, title: string, readTime?: number) => {
    trackInteraction({
      action: 'blog_read',
      element: slug,
      category: 'Blog',
      value: readTime
    })
  }, [trackInteraction])

  const trackContactForm = useCallback((formType: string) => {
    trackInteraction({
      action: 'contact_form',
      element: formType,
      category: 'Contact'
    })
  }, [trackInteraction])

  const trackAvailabilityCheck = useCallback((date: string, time: string, available: boolean) => {
    trackBusinessEvent({
      action: 'availability_checked',
      details: {
        date,
        time,
        available,
        check_timestamp: new Date().toISOString()
      }
    })
  }, [trackBusinessEvent])

  return {
    // Core tracking functions
    trackPageView,
    trackReservation,
    trackInteraction,
    trackBusinessEvent,
    trackConversion,
    trackError,
    trackPerformance,
    
    // Utility functions
    trackMenuView,
    trackBlogRead,
    trackContactForm,
    trackAvailabilityCheck,
    
    // Custom tracking
    trackCustomEvent
  }
} 