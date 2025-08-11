-- Authentication Logging and Session Management System
-- This migration creates tables and functions for comprehensive auth logging and session management

-- Create auth_logs table for authentication audit trail
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    email TEXT,
    action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'admin_check', 'access_denied')),
    method TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table for session tracking
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint (optional, depends on your setup)
    CONSTRAINT fk_admin_sessions_user_id FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs(email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON auth_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON auth_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_success ON auth_logs(success);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_email ON admin_sessions(email);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_activity ON admin_sessions(last_activity DESC);

-- Function to create or update admin session
CREATE OR REPLACE FUNCTION create_or_update_admin_session(
    p_user_id UUID,
    p_email TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_duration_hours INTEGER DEFAULT 8
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_id UUID;
    expires_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate expiration time
    expires_timestamp := NOW() + (p_session_duration_hours || ' hours')::INTERVAL;
    
    -- Deactivate any existing active sessions for this user
    UPDATE admin_sessions 
    SET is_active = false, 
        updated_at = NOW()
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Create new session
    INSERT INTO admin_sessions (
        user_id,
        email,
        session_start,
        last_activity,
        expires_at,
        ip_address,
        user_agent,
        is_active
    ) VALUES (
        p_user_id,
        p_email,
        NOW(),
        NOW(),
        expires_timestamp,
        p_ip_address,
        p_user_agent,
        true
    ) RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
    p_user_id UUID,
    p_extend_session BOOLEAN DEFAULT true
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_found BOOLEAN := false;
BEGIN
    -- Update last activity and optionally extend expiration
    UPDATE admin_sessions 
    SET last_activity = NOW(),
        expires_at = CASE 
            WHEN p_extend_session THEN NOW() + INTERVAL '8 hours'
            ELSE expires_at
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id 
      AND is_active = true 
      AND expires_at > NOW();
    
    GET DIAGNOSTICS session_found = FOUND;
    
    RETURN session_found;
END;
$$;

-- Function to invalidate admin session
CREATE OR REPLACE FUNCTION invalidate_admin_session(
    p_user_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sessions_updated INTEGER := 0;
BEGIN
    IF p_session_id IS NOT NULL THEN
        -- Invalidate specific session
        UPDATE admin_sessions 
        SET is_active = false, 
            updated_at = NOW()
        WHERE id = p_session_id;
        
        GET DIAGNOSTICS sessions_updated = ROW_COUNT;
    ELSIF p_user_id IS NOT NULL THEN
        -- Invalidate all sessions for user
        UPDATE admin_sessions 
        SET is_active = false, 
            updated_at = NOW()
        WHERE user_id = p_user_id AND is_active = true;
        
        GET DIAGNOSTICS sessions_updated = ROW_COUNT;
    END IF;
    
    RETURN sessions_updated > 0;
END;
$$;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cleaned_count INTEGER := 0;
BEGIN
    -- Mark expired sessions as inactive
    UPDATE admin_sessions 
    SET is_active = false, 
        updated_at = NOW()
    WHERE is_active = true 
      AND expires_at < NOW();
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    -- Delete old inactive sessions (older than 30 days)
    DELETE FROM admin_sessions 
    WHERE is_active = false 
      AND updated_at < NOW() - INTERVAL '30 days';
    
    RETURN cleaned_count;
END;
$$;

-- Function to clean old auth logs
CREATE OR REPLACE FUNCTION clean_old_auth_logs(
    p_days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    DELETE FROM auth_logs 
    WHERE timestamp < NOW() - (p_days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to get admin session info
CREATE OR REPLACE FUNCTION get_admin_session_info(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    email TEXT,
    session_start TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN,
    ip_address INET,
    user_agent TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.email,
        s.session_start,
        s.last_activity,
        s.expires_at,
        s.is_active,
        s.ip_address,
        s.user_agent
    FROM admin_sessions s
    WHERE s.user_id = p_user_id
      AND s.is_active = true
      AND s.expires_at > NOW()
    ORDER BY s.last_activity DESC
    LIMIT 1;
END;
$$;

-- Function to get authentication statistics
CREATE OR REPLACE FUNCTION get_auth_statistics(
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_logins BIGINT,
    successful_logins BIGINT,
    failed_logins BIGINT,
    admin_checks BIGINT,
    access_denied BIGINT,
    unique_users BIGINT,
    success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE action = 'login') as total_logins,
        COUNT(*) FILTER (WHERE action = 'login' AND success = true) as successful_logins,
        COUNT(*) FILTER (WHERE action = 'login' AND success = false) as failed_logins,
        COUNT(*) FILTER (WHERE action = 'admin_check') as admin_checks,
        COUNT(*) FILTER (WHERE action = 'access_denied') as access_denied,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
        ROUND(
            (COUNT(*) FILTER (WHERE success = true)::NUMERIC / 
             NULLIF(COUNT(*), 0)::NUMERIC) * 100, 
            2
        ) as success_rate
    FROM auth_logs 
    WHERE timestamp >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$;

-- RLS Policies for auth_logs table
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read auth logs
CREATE POLICY "Admins can read auth logs" ON auth_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Policy: System can insert auth logs (for logging functions)
CREATE POLICY "System can insert auth logs" ON auth_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for admin_sessions table
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own sessions
CREATE POLICY "Admins can read own sessions" ON admin_sessions
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Policy: System can manage admin sessions
CREATE POLICY "System can manage admin sessions" ON admin_sessions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Create a scheduled job to clean expired sessions (if pg_cron is available)
-- This is optional and depends on your Supabase setup
-- SELECT cron.schedule('clean-expired-sessions', '0 */6 * * *', 'SELECT clean_expired_sessions();');
-- SELECT cron.schedule('clean-old-auth-logs', '0 2 * * *', 'SELECT clean_old_auth_logs(30);');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON auth_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_sessions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_or_update_admin_session TO authenticated;
GRANT EXECUTE ON FUNCTION update_session_activity TO authenticated;
GRANT EXECUTE ON FUNCTION invalidate_admin_session TO authenticated;
GRANT EXECUTE ON FUNCTION clean_expired_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_auth_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_session_info TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_statistics TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE auth_logs IS 'Comprehensive authentication audit trail';
COMMENT ON TABLE admin_sessions IS 'Admin session tracking and management';
COMMENT ON FUNCTION create_or_update_admin_session IS 'Creates new admin session and deactivates old ones';
COMMENT ON FUNCTION update_session_activity IS 'Updates session last activity and optionally extends expiration';
COMMENT ON FUNCTION invalidate_admin_session IS 'Invalidates admin sessions by user ID or session ID';
COMMENT ON FUNCTION clean_expired_sessions IS 'Cleans up expired and old sessions';
COMMENT ON FUNCTION clean_old_auth_logs IS 'Removes old authentication logs';
COMMENT ON FUNCTION get_admin_session_info IS 'Gets current active session info for a user';
COMMENT ON FUNCTION get_auth_statistics IS 'Returns authentication statistics for specified period';