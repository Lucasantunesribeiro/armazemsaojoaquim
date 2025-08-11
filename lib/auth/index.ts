// Main auth module exports
export * from './types'
export * from './cache'
export * from './admin-verification'
export * from './enhanced-login'
export * from './error-recovery'
export * from './logging'
export * from './profile-management'
export * from './session-management'
export * from './performance'

// Re-export commonly used functions
export {
  verifyAdminStatus,
  checkAdminCredentials
} from './admin-verification'

export {
  enhancedLogin,
  enhancedLogout,
  validateAndRefreshSession
} from './enhanced-login'

export {
  recoverFromAuthError,
  retryWithBackoff,
  authSystemHealthCheck
} from './error-recovery'

export {
  logAuthEvent,
  getAuthLogs,
  cleanOldAuthLogs
} from './logging'

export {
  createOrUpdateAdminProfile,
  validateProfileConsistency,
  fixProfileInconsistencies,
  getAdminProfileDiagnostics
} from './profile-management'

export {
  createAdminSession,
  updateSessionActivity,
  invalidateAdminSession,
  getAdminSessionInfo,
  isSessionValid,
  cleanExpiredSessions,
  getAuthStatistics,
  getSessionTimeoutWarning,
  extendSession
} from './session-management'

export { adminCache } from './cache'