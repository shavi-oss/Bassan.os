-- Bassan.os Database Seed Data
-- Version: 2.2
-- Purpose: Initial data for development and testing environments
-- WARNING: Do NOT run in production

-- ============================================================
-- ORGANIZATION (Tenant)
-- ============================================================
INSERT INTO organizations (id, name, slug, tier, is_active, settings, created_at, updated_at) VALUES
('org-001-uuid-0000-000000000001', 'Demo Company', 'demo', 'enterprise', true, '{"timezone": "UTC", "currency": "USD", "language": "en"}', NOW(), NOW()),
('org-002-uuid-0000-000000000002', 'Test Organization', 'test-org', 'professional', true, '{"timezone": "UTC", "currency": "USD", "language": "en"}', NOW(), NOW());

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, name, description, organization_id, created_at, updated_at) VALUES
('role-admin-0000-000000000001', 'Admin', 'Full system access', 'org-001-uuid-0000-000000000001', NOW(), NOW()),
('role-sales-0000-000000000002', 'Sales Rep', 'Sales module access', 'org-001-uuid-0000-000000000001', NOW(), NOW()),
('role-sales-mgr-00000000003', 'Sales Manager', 'Sales module + reports', 'org-001-uuid-0000-000000000001', NOW(), NOW()),
('role-ops-00000-000000000004', 'Operations Staff', 'Operations module access', 'org-001-uuid-0000-000000000001', NOW(), NOW()),
('role-ops-mgr-0000000000005', 'Operations Manager', 'Operations + SLA management', 'org-001-uuid-0000-000000000001', NOW(), NOW());

-- ============================================================
-- PERMISSIONS (Sample)
-- ============================================================
INSERT INTO permissions (id, action, resource, role_id) VALUES
-- Admin permissions
('perm-0001-0000-000000000001', 'manage', '*', 'role-admin-0000-000000000001'),
-- Sales Rep permissions
('perm-0002-0000-000000000002', 'read', 'leads', 'role-sales-0000-000000000002'),
('perm-0003-0000-000000000003', 'write', 'leads', 'role-sales-0000-000000000002'),
('perm-0004-0000-000000000004', 'read', 'opportunities', 'role-sales-0000-000000000002'),
('perm-0005-0000-000000000005', 'write', 'opportunities', 'role-sales-0000-000000000002'),
-- Sales Manager permissions (inherits Sales Rep + reports)
('perm-0006-0000-000000000006', 'read', 'leads', 'role-sales-mgr-00000000003'),
('perm-0007-0000-000000000007', 'write', 'leads', 'role-sales-mgr-00000000003'),
('perm-0008-0000-000000000008', 'assign', 'leads', 'role-sales-mgr-00000000003'),
('perm-0009-0000-000000000009', 'read', 'reports', 'role-sales-mgr-00000000003'),
-- Operations Staff permissions
('perm-0010-0000-000000000010', 'read', 'tasks', 'role-ops-00000-000000000004'),
('perm-0011-0000-000000000011', 'write', 'tasks', 'role-ops-00000-000000000004');

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, organization_id, created_at, updated_at) VALUES
-- Admin user (password: Admin123!)
('user-admin-0000-000000000001', 'admin@bassan.os', '$2b$10$examplehashadmin1234567890', 'System', 'Admin', true, 'org-001-uuid-0000-000000000001', NOW(), NOW()),
-- Sales Manager (password: Sales123!)
('user-sales-mgr-000000000002', 'sarah.manager@demo.com', '$2b$10$examplehashsales1234567890', 'Sarah', 'Manager', true, 'org-001-uuid-0000-000000000001', NOW(), NOW()),
-- Sales Rep 1 (password: Rep123!)
('user-sales-rep1-00000000003', 'john.doe@demo.com', '$2b$10$examplehashrep11234567890', 'John', 'Doe', true, 'org-001-uuid-0000-000000000001', NOW(), NOW()),
-- Sales Rep 2 (password: Rep123!)
('user-sales-rep2-00000000004', 'jane.smith@demo.com', '$2b$10$examplehashrep21234567890', 'Jane', 'Smith', true, 'org-001-uuid-0000-000000000001', NOW(), NOW()),
-- Operations Manager (password: Ops123!)
('user-ops-mgr-0000000000005', 'mike.ops@demo.com', '$2b$10$examplehashops11234567890', 'Mike', 'Operations', true, 'org-001-uuid-0000-000000000001', NOW(), NOW()),
-- Operations Staff (password: Staff123!)
('user-ops-staff-0000000006', 'lisa.staff@demo.com', '$2b$10$examplehashstaff1234567890', 'Lisa', 'Staff', true, 'org-001-uuid-0000-000000000001', NOW(), NOW());

-- ============================================================
-- USER ROLES (Junction Table)
-- ============================================================
INSERT INTO user_roles (user_id, role_id) VALUES
('user-admin-0000-000000000001', 'role-admin-0000-000000000001'),
('user-sales-mgr-000000000002', 'role-sales-mgr-00000000003'),
('user-sales-rep1-00000000003', 'role-sales-0000-000000000002'),
('user-sales-rep2-00000000004', 'role-sales-0000-000000000002'),
('user-ops-mgr-0000000000005', 'role-ops-mgr-0000000000005'),
('user-ops-staff-0000000006', 'role-ops-00000-000000000004');

-- ============================================================
-- LEADS (Sample Data)
-- ============================================================
INSERT INTO leads (id, first_name, last_name, email, phone, company, status, source, score, organization_id, assigned_to, created_at, updated_at) VALUES
('lead-0001-0000-000000000001', 'Alice', 'Johnson', 'alice@abccorp.com', '+1-555-0101', 'ABC Corporation', 'new', 'website', 75, 'org-001-uuid-0000-000000000001', 'user-sales-rep1-00000000003', NOW(), NOW()),
('lead-0002-0000-000000000002', 'Bob', 'Williams', 'bob@xyzinc.com', '+1-555-0102', 'XYZ Inc', 'contacted', 'referral', 85, 'org-001-uuid-0000-000000000001', 'user-sales-rep1-00000000003', NOW(), NOW()),
('lead-0003-0000-000000000003', 'Carol', 'Davis', 'carol@techstart.io', '+1-555-0103', 'TechStart', 'qualified', 'linkedin', 92, 'org-001-uuid-0000-000000000001', 'user-sales-rep2-00000000004', NOW(), NOW()),
('lead-0004-0000-000000000004', 'David', 'Miller', 'david@globalco.com', '+1-555-0104', 'Global Co', 'new', 'trade_show', 68, 'org-001-uuid-0000-000000000001', 'user-sales-rep2-00000000004', NOW(), NOW()),
('lead-0005-0000-000000000005', 'Eva', 'Brown', 'eva@startup.io', '+1-555-0105', 'Startup.io', 'contacted', 'website', 78, 'org-001-uuid-0000-000000000001', NULL, NOW(), NOW());

-- ============================================================
-- TASKS (Sample Data)
-- ============================================================
INSERT INTO tasks (id, title, description, status, priority, due_date, organization_id, assigned_to, created_by, created_at, updated_at) VALUES
('task-0001-0000-000000000001', 'Follow-up call with ABC Corp', 'Discuss proposal and pricing', 'pending', 'high', NOW() + INTERVAL '2 days', 'org-001-uuid-0000-000000000001', 'user-sales-rep1-00000000003', 'user-sales-mgr-000000000002', NOW(), NOW()),
('task-0002-0000-000000000002', 'Send quote to XYZ Inc', 'Prepare and send formal quote', 'in_progress', 'medium', NOW() + INTERVAL '3 days', 'org-001-uuid-0000-000000000001', 'user-sales-rep1-00000000003', 'user-sales-mgr-000000000002', NOW(), NOW()),
('task-0003-0000-000000000003', 'Demo for TechStart', 'Product demonstration meeting', 'pending', 'high', NOW() + INTERVAL '1 day', 'org-001-uuid-0000-000000000001', 'user-sales-rep2-00000000004', 'user-sales-mgr-000000000002', NOW(), NOW()),
('task-0004-0000-000000000004', 'Process order #12345', 'Verify and process customer order', 'pending', 'medium', NOW() + INTERVAL '4 hours', 'org-001-uuid-0000-000000000001', 'user-ops-staff-0000000006', 'user-ops-mgr-0000000000005', NOW(), NOW()),
('task-0005-0000-000000000005', 'Quality check batch #789', 'Perform quality inspection', 'pending', 'low', NOW() + INTERVAL '1 day', 'org-001-uuid-0000-000000000001', 'user-ops-staff-0000000006', 'user-ops-mgr-0000000000005', NOW(), NOW());

-- ============================================================
-- SUMMARY
-- ============================================================
-- Organizations: 2
-- Roles: 5
-- Permissions: 11
-- Users: 6
-- Leads: 5
-- Tasks: 5
-- Total Records: 34

-- ============================================================
-- NOTES FOR DEVELOPERS
-- ============================================================
-- 1. Password hashes are placeholders - regenerate with bcrypt
-- 2. UUIDs are simplified for readability - use proper UUIDs in production
-- 3. Extend this seed file as new entities are implemented
-- 4. Run: npm run db:seed to apply this data
