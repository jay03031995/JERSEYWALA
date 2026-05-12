-- store_settings: single-row JSONB blob for editable storefront content
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT store_settings_single_row CHECK (id = 1)
);

-- Seed default row if missing
INSERT INTO store_settings (id, data)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read, only service role writes
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read store settings" ON store_settings;
CREATE POLICY "Public can read store settings"
  ON store_settings FOR SELECT
  USING (TRUE);
