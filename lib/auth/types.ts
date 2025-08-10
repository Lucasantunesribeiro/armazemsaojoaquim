// Authentication types and interfaces
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  success: boolean
  user?: any
  session?: any
  error?: string
  isAdmin?: boolean
}

export interface AdminVerificationResult {
  isAdmin: boolean
  method: 'email' | 'database' | 'cache' | 'fallback'
  profile?: UserProfile
  error?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: 'user' | 'admin' | 'moderator'
  created_at: string
  updated_at: string
  last_login?: string
  login_count?: number
}

export interface AdminSession {
  user_id: string
  email: string
  role: string
  session_start: string
  last_activity: string
  expires_at: string
  is_active: boolean
}

export enum AuthErrorType {
  NO_SESSION = 'no_session',
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCESS_DENIED = 'access_denied',
  PROFILE_NOT_FOUND = 'profile_not_found',
  RLS_ERROR = 'rls_error',
  DATABASE_ERROR = 'database_error',
  MIDDLEWARE_ERROR = 'middleware_error'
}

export interface AuthError {
  type: AuthErrorType
  message: string
  details?: any
  timestamp: string
}

export interface AuthLog {
  timestamp: string
  user_id: string
  email: string
  action: 'login' | 'logout' | 'admin_check' | 'access_denied'
  method: string
  ip_address: string
  user_agent: string
  success: boolean
  error?: string
}