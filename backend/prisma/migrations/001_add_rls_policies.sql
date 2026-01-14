
-- Phase 0: Multi-Tenancy Foundation
-- RLS Policies Migration
-- This migration enables Row-Level Security on all tables

-- ============================================================
-- STEP 1: Enable RLS on all tables
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Create isolation policies for each table
-- ============================================================

-- Users: Only access users from same tenant
CREATE POLICY user_isolation ON users
  FOR ALL
  USING (organization_id = current_setting('app.current_tenant'));

-- Roles: Only access roles from same tenant
CREATE POLICY role_isolation ON roles
  FOR ALL
  USING (organization_id = current_setting('app.current_tenant'));

-- Leads: Only access leads from same tenant
CREATE POLICY lead_isolation ON leads
  FOR ALL
  USING (organization_id = current_setting('app.current_tenant'));

-- Tasks: Only access tasks from same tenant
CREATE POLICY task_isolation ON tasks
  FOR ALL
  USING (organization_id = current_setting('app.current_tenant'));

-- Organizations: Only access own organization
CREATE POLICY organization_isolation ON organizations
  FOR ALL
  USING (id = current_setting('app.current_tenant'));

-- User Roles: Only access roles from same tenant
CREATE POLICY user_role_isolation ON user_roles
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE organization_id = current_setting('app.current_tenant')
    )
  );

-- Permissions: Only access permissions from same tenant
CREATE POLICY permission_isolation ON permissions
  FOR ALL
  USING (
    role_id IN (
      SELECT id FROM roles 
      WHERE organization_id = current_setting('app.current_tenant')
    )
  );

-- Refresh Tokens: Only access tokens from same tenant
CREATE POLICY refresh_token_isolation ON refresh_tokens
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE organization_id = current_setting('app.current_tenant')
    )
  );

-- ============================================================
-- STEP 3: Grant necessary permissions
-- ============================================================

-- Ensure app user has necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app;

-- ============================================================
-- STEP 4: Create function to set tenant context
-- ============================================================

CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION set_tenant_context TO app;
