-- Notifications System Migration
-- File: backend/prisma/migrations/add_notifications.sql

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info')),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL
);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    types_enabled JSONB DEFAULT '["success", "warning", "error", "info"]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Sample notifications for testing
INSERT INTO notifications (user_id, company_id, type, priority, title, message, action_url, action_label) VALUES
(1, 1, 'success', 'normal', 'Welcome to Canary!', 'Your equipment rental system is ready to use.', '/dashboard', 'View Dashboard'),
(1, 1, 'info', 'normal', 'New Order Received', 'Order #1001 from Acme Corp has been placed.', '/orders/1001', 'View Order'),
(1, 1, 'warning', 'high', 'Low Stock Alert', 'Sony A7 IV camera has only 2 units available.', '/equipment/1', 'Manage Stock'),
(1, 1, 'error', 'urgent', 'Overdue Return', 'Canon EOS R6 is 3 days overdue from customer XYZ.', '/orders/overdue', 'View Overdue'),
(1, 1, 'info', 'low', 'Weekly Report Ready', 'Your weekly rental report is now available for download.', '/reports/weekly', 'Download Report');

-- Default notification preferences for existing users
INSERT INTO notification_preferences (user_id) 
SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM notification_preferences);