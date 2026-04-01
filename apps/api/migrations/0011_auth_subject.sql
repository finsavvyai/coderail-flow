-- Rename legacy Clerk-specific account subject columns to the provider-agnostic auth_subject name.

ALTER TABLE user_account RENAME COLUMN clerk_id TO auth_subject;

DROP INDEX IF EXISTS idx_user_clerk;
CREATE INDEX IF NOT EXISTS idx_user_account_auth_subject ON user_account(auth_subject);
