// Global type declarations
import { Database } from './database.types'

declare global {
  // Google Analytics gtag interface
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_title?: string
        page_location?: string
        page_path?: string
        send_page_view?: boolean
        anonymize_ip?: boolean
        allow_google_signals?: boolean
        allow_ad_personalization_signals?: boolean
        value?: number
        event_category?: string
        event_label?: string
        rating?: string
        non_interaction?: boolean
        description?: string
        fatal?: boolean
        error_component?: string
        visibility_state?: string
        user_id?: string
        custom_map?: { [key: string]: string }
        [key: string]: any
      }
    ) => void
    dataLayer?: any[]
  }

  // Service Worker registration
  interface Navigator {
    serviceWorker?: ServiceWorkerContainer
  }

  // Supabase environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      NEXT_PUBLIC_GA_ID?: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }

  // Web Vitals types extension
  interface WebVitalMetric {
    name: string
    value: number
    id: string
    rating: 'good' | 'needs-improvement' | 'poor'
  }

  // Performance Observer types
  interface PerformanceEntry {
    entryType: string
    name: string
    startTime: number
    duration: number
  }

  // Extended Performance API
  interface Performance {
    getEntriesByType(type: string): PerformanceEntry[]
    mark(markName: string): void
    measure(measureName: string, startMark?: string, endMark?: string): void
  }

  // Intersection Observer
  interface IntersectionObserverEntry {
    boundingClientRect: DOMRectReadOnly
    intersectionRatio: number
    intersectionRect: DOMRectReadOnly
    isIntersecting: boolean
    rootBounds: DOMRectReadOnly | null
    target: Element
    time: number
  }

  // Notification API
  interface NotificationOptions {
    badge?: string
    body?: string
    data?: any
    dir?: NotificationDirection
    icon?: string
    image?: string
    lang?: string
    renotify?: boolean
    requireInteraction?: boolean
    silent?: boolean
    tag?: string
    timestamp?: number
    vibrate?: VibratePattern
  }

  // PWA Install prompt
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
    prompt(): Promise<void>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

// Module declarations
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

// CSS Modules
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

export {} 