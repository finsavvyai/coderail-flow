-- Billing: users, subscriptions, usage tracking

CREATE TABLE IF NOT EXISTS user_account (
  id TEXT PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  runs_this_month INTEGER NOT NULL DEFAULT 0,
  runs_reset_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_event (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_account(id),
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_clerk ON user_account(clerk_id);
CREATE INDEX IF NOT EXISTS idx_user_stripe ON user_account(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_user ON payment_event(user_id);
