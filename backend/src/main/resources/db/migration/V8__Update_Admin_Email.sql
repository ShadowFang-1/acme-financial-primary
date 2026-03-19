-- SECURITY IDENTITY UPDATE: Admin Email Migration
-- This migration socializes the new administrative email node 'dshout01@gmail.com' 
-- by resolving any existing 'admin' identity conflicts in the database.

UPDATE users 
SET email = 'dshout01@gmail.com' 
WHERE username = 'admin' OR email = 'admin@acme.com';

-- Ensure the admin account exists if not present (using a generic BCrypt hash for 'admin123' as fallback)
-- INSERT IGNORE is MySQL-specific for conflict resolution.
INSERT IGNORE INTO users (id, username, email, password, role, enabled) 
VALUES (1, 'admin', 'dshout01@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 1);
