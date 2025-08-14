import { createClient } from '@/lib/supabase/server'
import { UserProfile } from './types'
import { adminCache } from './cache'
import { logAuthEvent } from './logging'

/**
 * Admin profile management utilities
 */

/**
 * Create or update admin profile
 */
export async function createOrUpdateAdminProfile(user: any): Promise<UserProfile | null> {
  if (!user || user.email !== 'armazemsaojoaquimoficial@gmail.com') {
    return null
  }

  try {
    const supabase = await createClient()
    
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: 'Administrador Armazém São Joaquim',
      role: 'admin' as const,
      updated_at: new Date().toISOString()
    }

    // Use upsert to create or update
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        ...profileData,
        created_at: new Date().toISOString() // Only set on insert
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating admin profile:', error)
      return null
    }

    // Clear cache to force refresh
    adminCache.clear(user.id)
    
    await logAuthEvent({
      user_id: user.id,
      email: user.email,
      action: 'admin_check',
      method: 'profile_upsert',
      success: true
    })

    return profile as UserProfile

  } catch (error) {
    console.error('Error in createOrUpdateAdminProfile:', error)
    return null
  }
}

/**
 * Validate profile consistency
 */
export async function validateProfileConsistency(userId: string): Promise<{
  consistent: boolean
  issues: string[]
  profile?: UserProfile
}> {
  const issues: string[] = []
  
  try {
    const supabase = await createClient()
    
    // Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      issues.push('Cannot access auth user data')
      return { consistent: false, issues }
    }
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      issues.push('Profile not found in database')
      return { consistent: false, issues }
    }
    
    // Check email consistency
    if (user.email !== profile.email) {
      issues.push(`Email mismatch: auth(${user.email}) vs profile(${profile.email})`)
    }
    
    // Check admin role consistency
    if (user.email === 'armazemsaojoaquimoficial@gmail.com' && profile.role !== 'admin') {
      issues.push(`Admin user should have admin role, but has: ${profile.role}`)
    }
    
    // Check required fields
    if (!profile.full_name) {
      issues.push('Profile missing full_name')
    }
    
    if (!profile.created_at) {
      issues.push('Profile missing created_at')
    }
    
    if (!profile.updated_at) {
      issues.push('Profile missing updated_at')
    }
    
    return {
      consistent: issues.length === 0,
      issues,
      profile: profile as UserProfile
    }
    
  } catch (error) {
    issues.push(`Validation error: ${error}`)
    return { consistent: false, issues }
  }
}

/**
 * Fix profile inconsistencies
 */
export async function fixProfileInconsistencies(userId: string): Promise<{
  fixed: boolean
  fixedIssues: string[]
  remainingIssues: string[]
}> {
  const fixedIssues: string[] = []
  const remainingIssues: string[] = []
  
  try {
    const supabase = await createClient()
    
    // First validate to see what needs fixing
    const validation = await validateProfileConsistency(userId)
    
    if (validation.consistent) {
      return { fixed: true, fixedIssues: ['Already consistent'], remainingIssues: [] }
    }
    
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      remainingIssues.push('Cannot access auth user for fixes')
      return { fixed: false, fixedIssues, remainingIssues }
    }
    
    // Prepare update data
    const updateData: Partial<UserProfile> = {
      updated_at: new Date().toISOString()
    }
    
    // Fix email mismatch
    if (validation.issues.some(issue => issue.includes('Email mismatch'))) {
      updateData.email = user.email!
      fixedIssues.push('Fixed email mismatch')
    }
    
    // Fix admin role
    if (validation.issues.some(issue => issue.includes('Admin user should have admin role'))) {
      updateData.role = 'admin'
      fixedIssues.push('Fixed admin role')
    }
    
    // Fix missing full_name
    if (validation.issues.some(issue => issue.includes('missing full_name'))) {
      updateData.full_name = 'Administrador Armazém São Joaquim'
      fixedIssues.push('Added missing full_name')
    }
    
    // Apply fixes
    if (Object.keys(updateData).length > 1) { // More than just updated_at
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
      
      if (updateError) {
        remainingIssues.push(`Failed to apply fixes: ${updateError.message}`)
      } else {
        // Clear cache after fixes
        adminCache.clear(userId)
        
        await logAuthEvent({
          user_id: userId,
          email: user.email!,
          action: 'admin_check',
          method: 'profile_fix',
          success: true,
          error: `Fixed: ${fixedIssues.join(', ')}`
        })
      }
    }
    
    // Check for remaining issues that couldn't be fixed
    validation.issues.forEach(issue => {
      if (!fixedIssues.some(fixed => issue.includes(fixed.split(' ')[1]))) {
        remainingIssues.push(issue)
      }
    })
    
    return {
      fixed: remainingIssues.length === 0,
      fixedIssues,
      remainingIssues
    }
    
  } catch (error) {
    remainingIssues.push(`Fix error: ${error}`)
    return { fixed: false, fixedIssues, remainingIssues }
  }
}

/**
 * Backup admin profile data
 */
export async function backupAdminProfile(userId: string): Promise<{
  success: boolean
  backup?: UserProfile
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !profile) {
      return { success: false, error: 'Profile not found for backup' }
    }
    
    // Store backup (in a real app, you might want to store this in a separate table)
    const backup = {
      ...profile,
      backup_timestamp: new Date().toISOString()
    }
    
    // For now, just return the backup data
    // In production, you might want to store this in a backups table
    
    return { success: true, backup: profile as UserProfile }
    
  } catch (error) {
    return { success: false, error: `Backup failed: ${error}` }
  }
}

/**
 * Restore admin profile from backup
 */
export async function restoreAdminProfile(userId: string, backup: UserProfile): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Remove backup-specific fields
    const { backup_timestamp, ...profileData } = backup as any
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (error) {
      return { success: false, error: `Restore failed: ${error.message}` }
    }
    
    // Clear cache after restore
    adminCache.clear(userId)
    
    await logAuthEvent({
      user_id: userId,
      email: backup.email,
      action: 'admin_check',
      method: 'profile_restore',
      success: true
    })
    
    return { success: true }
    
  } catch (error) {
    return { success: false, error: `Restore error: ${error}` }
  }
}

/**
 * Get admin profile diagnostics
 */
export async function getAdminProfileDiagnostics(userId: string): Promise<{
  profile?: UserProfile
  validation: Awaited<ReturnType<typeof validateProfileConsistency>>
  cacheStatus: { cached: boolean; entry?: any }
  lastLogin?: string
  loginCount?: number
}> {
  try {
    const supabase = await createClient()
    
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    // Validate consistency
    const validation = await validateProfileConsistency(userId)
    
    // Check cache status
    const cacheEntry = adminCache.get(userId)
    const cacheStatus = {
      cached: !!cacheEntry,
      entry: cacheEntry
    }
    
    return {
      profile: profile as UserProfile,
      validation,
      cacheStatus,
      lastLogin: profile?.last_login,
      loginCount: profile?.login_count
    }
    
  } catch (error) {
    console.error('Diagnostics error:', error)
    
    const validation = await validateProfileConsistency(userId)
    const cacheEntry = adminCache.get(userId)
    
    return {
      validation,
      cacheStatus: {
        cached: !!cacheEntry,
        entry: cacheEntry
      }
    }
  }
}