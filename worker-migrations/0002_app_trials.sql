CREATE TABLE IF NOT EXISTS app_trials (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES app_users(id),
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'business', 'max')),
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
