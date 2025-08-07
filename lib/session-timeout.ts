import { createClient } from './supabase'

// Session timeout configuration
export const SESSION_CONFIG = {
  TIMEOUT_DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  WARNING_DURATION: 15 * 60 * 1000, // 15 minutes warning before timeout
  CHECK_INTERVAL: 60 * 1000, // Check every minute
  ADMIN_EMAIL: 'armazemsaojoaquimoficial@gmail.com'
} as const

// Session timeout manager class
export class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null
  private warningId: NodeJS.Timeout | null = null
  private checkIntervalId: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private isActive: boolean = false
  private onWarning?: () => void
  private onTimeout?: () => void

  constructor(options?: {
    onWarning?: () => void
    onTimeout?: () => void
  }) {
    this.onWarning = options?.onWarning
    this.onTimeout = options?.onTimeout
    
    // Bind methods to preserve context
    this.resetTimer = this.resetTimer.bind(this)
    this.handleActivity = this.handleActivity.bind(this)
    this.checkSession = this.checkSession.bind(this)
  }

  // Start session timeout monitoring
  start(): void {
    if (this.isActive) return
    
    console.log('🕐 SESSION: Starting timeout monitoring')
    this.isActive = true
    this.lastActivity = Date.now()
    
    // Set up activity listeners
    this.setupActivityListeners()
    
    // Start periodic session checks
    this.startPeriodicCheck()
    
    // Set initial timeout
    this.resetTimer()
  }

  // Stop session timeout monitoring
  stop(): void {
    if (!this.isActive) return
    
    console.log('🛑 SESSION: Stopping timeout monitoring')
    this.isActive = false
    
    // Clear all timers
    this.clearTimers()
    
    // Remove activity listeners
    this.removeActivityListeners()
    
    // Stop periodic checks
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }
  }

  // Reset the timeout timer
  resetTimer(): void {
    if (!this.isActive) return
    
    this.lastActivity = Date.now()
    this.clearTimers()
    
    // Set warning timer (timeout - warning duration)
    const warningTime = SESSION_CONFIG.TIMEOUT_DURATION - SESSION_CONFIG.WARNING_DURATION
    this.warningId = setTimeout(() => {
      console.log('⚠️ SESSION: Warning - session will expire soon')
      this.onWarning?.()
    }, warningTime)
    
    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      console.log('⏰ SESSION: Session timed out')
      this.handleTimeout()
    }, SESSION_CONFIG.TIMEOUT_DURATION)
  }

  // Handle user activity
  private handleActivity(): void {
    if (!this.isActive) return
    
    const now = Date.now()
    const timeSinceLastActivity = now - this.lastActivity
    
    // Only reset if enough time has passed (avoid excessive resets)
    if (timeSinceLastActivity > 30000) { // 30 seconds
      this.resetTimer()
    }
  }

  // Set up activity event listeners
  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true })
    })
  }

  // Remove activity event listeners
  private removeActivityListeners(): void {
    if (typeof window === 'undefined') return
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity)
    })
  }

  // Clear all timeout timers
  private clearTimers(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    
    if (this.warningId) {
      clearTimeout(this.warningId)
      this.warningId = null
    }
  }

  // Handle session timeout
  private async handleTimeout(): Promise<void> {
    console.log('🔒 SESSION: Handling timeout - logging out user')
    
    try {
      // Sign out from Supabase
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }
      
      // Call timeout callback
      this.onTimeout?.()
      
      // Redirect to auth page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const locale = currentPath.split('/')[1] || 'pt'
        window.location.href = `/${locale}/auth?message=Sua+sessão+expirou.+Faça+login+novamente.&timeout=true`
      }
      
    } catch (error) {
      console.error('❌ SESSION: Error during timeout handling:', error)
    } finally {
      this.stop()
    }
  }

  // Start periodic session validation
  private startPeriodicCheck(): void {
    this.checkIntervalId = setInterval(this.checkSession, SESSION_CONFIG.CHECK_INTERVAL)
  }

  // Check if session is still valid
  private async checkSession(): Promise<void> {
    if (!this.isActive) return
    
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('❌ SESSION: Session invalid during check')
        await this.handleTimeout()
        return
      }
      
      // Check if session is expired based on creation time
      const sessionAge = Date.now() - new Date(session.created_at).getTime()
      if (sessionAge > SESSION_CONFIG.TIMEOUT_DURATION) {
        console.log('⏰ SESSION: Session expired based on age')
        await this.handleTimeout()
        return
      }
      
      // For admin users, verify admin status periodically
      if (session.user.email === SESSION_CONFIG.ADMIN_EMAIL) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', session.user.email)
          .single()
        
        if (!profile || profile.role !== 'admin') {
          console.log('❌ SESSION: Admin privileges revoked')
          await this.handleTimeout()
          return
        }
      }
      
    } catch (error) {
      console.error('❌ SESSION: Error during session check:', error)
    }
  }

  // Get remaining time until timeout
  getRemainingTime(): number {
    if (!this.isActive) return 0
    
    const elapsed = Date.now() - this.lastActivity
    const remaining = SESSION_CONFIG.TIMEOUT_DURATION - elapsed
    
    return Math.max(0, remaining)
  }

  // Check if session is about to expire
  isNearExpiry(): boolean {
    const remaining = this.getRemainingTime()
    return remaining <= SESSION_CONFIG.WARNING_DURATION && remaining > 0
  }

  // Extend session (reset timer)
  extendSession(): void {
    if (this.isActive) {
      console.log('🔄 SESSION: Session extended by user action')
      this.resetTimer()
    }
  }
}

// Global session manager instance
let globalSessionManager: SessionTimeoutManager | null = null

// Initialize session timeout for admin users
export function initializeSessionTimeout(options?: {
  onWarning?: () => void
  onTimeout?: () => void
}): SessionTimeoutManager {
  if (typeof window === 'undefined') {
    // Return a mock manager for server-side
    return {
      start: () => {},
      stop: () => {},
      resetTimer: () => {},
      getRemainingTime: () => 0,
      isNearExpiry: () => false,
      extendSession: () => {}
    } as SessionTimeoutManager
  }
  
  // Stop existing manager if any
  if (globalSessionManager) {
    globalSessionManager.stop()
  }
  
  // Create new manager
  globalSessionManager = new SessionTimeoutManager(options)
  
  return globalSessionManager
}

// Get the current session manager
export function getSessionManager(): SessionTimeoutManager | null {
  return globalSessionManager
}

// Utility function to format remaining time
export function formatRemainingTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (60 * 1000))
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  
  return `${seconds}s`
}

// Hook for React components to use session timeout
export function useSessionTimeout(options?: {
  onWarning?: () => void
  onTimeout?: () => void
}) {
  if (typeof window === 'undefined') {
    return {
      manager: null,
      remainingTime: 0,
      isNearExpiry: false,
      extendSession: () => {},
      formatTime: (ms: number) => formatRemainingTime(ms)
    }
  }
  
  const manager = globalSessionManager || initializeSessionTimeout(options)
  
  return {
    manager,
    remainingTime: manager.getRemainingTime(),
    isNearExpiry: manager.isNearExpiry(),
    extendSession: () => manager.extendSession(),
    formatTime: formatRemainingTime
  }
}

// Utility to check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) return false
    
    // Check by email first
    if (session.user.email === SESSION_CONFIG.ADMIN_EMAIL) {
      return true
    }
    
    // Check by database role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    return profile?.role === 'admin'
    
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Auto-initialize session timeout for admin users
if (typeof window !== 'undefined') {
  // Check if user is admin and initialize timeout
  isCurrentUserAdmin().then(isAdmin => {
    if (isAdmin && !globalSessionManager) {
      console.log('🔐 SESSION: Auto-initializing timeout for admin user')
      initializeSessionTimeout({
        onWarning: () => {
          console.log('⚠️ SESSION: Session expiring soon')
          // Could show a toast notification here
        },
        onTimeout: () => {
          console.log('⏰ SESSION: Session expired - redirecting to login')
        }
      }).start()
    }
  }).catch(error => {
    console.error('Error checking admin status for session timeout:', error)
  })
}