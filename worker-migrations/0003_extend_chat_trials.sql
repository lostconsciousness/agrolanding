-- Extend existing short trials to seven days from their ORIGINAL start.
-- Never shorten a longer entitlement or reset a trial on repeat sign-in.
UPDATE app_trials
SET expires_at = started_at + 604800000
WHERE expires_at < started_at + 604800000;
