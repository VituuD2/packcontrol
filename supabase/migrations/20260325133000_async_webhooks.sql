-- Add status, attempts, error, and locking columns to webhook_events
ALTER TABLE webhook_events 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
ADD COLUMN attempts INT DEFAULT 0,
ADD COLUMN last_error TEXT,
ADD COLUMN locked_at TIMESTAMPTZ,
ADD COLUMN locked_by TEXT,
ADD COLUMN next_retry_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN idempotency_key TEXT UNIQUE;

-- Data migration: Maintain existing legacy data state
UPDATE webhook_events 
SET status = 'processed' WHERE processed = true;

UPDATE webhook_events 
SET status = 'pending' WHERE processed = false OR processed IS NULL;

-- Create indexes for worker queue performance
CREATE INDEX idx_webhook_events_queue ON webhook_events(status, next_retry_at) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_webhook_events_idempotency ON webhook_events(idempotency_key);
