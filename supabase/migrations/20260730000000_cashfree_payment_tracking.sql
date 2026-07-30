-- Cashfree order identifiers keep checkout creation and webhook handling idempotent.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cashfree_order_id TEXT,
  ADD COLUMN IF NOT EXISTS cashfree_cf_order_id TEXT,
  ADD COLUMN IF NOT EXISTS cashfree_payment_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_cashfree_order_id
  ON orders(cashfree_order_id)
  WHERE cashfree_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_cashfree_cf_order_id
  ON orders(cashfree_cf_order_id)
  WHERE cashfree_cf_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_cashfree_payment_id
  ON orders(cashfree_payment_id)
  WHERE cashfree_payment_id IS NOT NULL;

-- Stripe is no longer an active gateway. Generic payment_reference remains
-- available for historical reporting before the legacy columns are removed.
DROP INDEX IF EXISTS idx_orders_stripe_checkout_session_id;
DROP INDEX IF EXISTS idx_orders_stripe_payment_intent_id;

ALTER TABLE orders
  DROP COLUMN IF EXISTS stripe_checkout_session_id,
  DROP COLUMN IF EXISTS stripe_payment_intent_id;
