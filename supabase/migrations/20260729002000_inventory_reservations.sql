ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS inventory_reserved BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION reserve_order_inventory(target_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line RECORD;
  current_stock INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM orders WHERE id = target_order_id AND inventory_reserved = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  FOR line IN
    SELECT variant_id, quantity
    FROM order_items
    WHERE order_id = target_order_id
    ORDER BY variant_id
  LOOP
    SELECT stock_quantity INTO current_stock
    FROM product_variants
    WHERE id = line.variant_id
    FOR UPDATE;

    IF current_stock IS NULL OR current_stock < line.quantity THEN
      RAISE EXCEPTION 'Insufficient inventory for variant %', line.variant_id;
    END IF;

    UPDATE product_variants
    SET stock_quantity = stock_quantity - line.quantity
    WHERE id = line.variant_id;

    INSERT INTO inventory_logs (
      variant_id, change_type, quantity_change, quantity_after, note
    )
    VALUES (
      line.variant_id,
      'sale',
      -line.quantity,
      current_stock - line.quantity,
      'Reserved for order ' || target_order_id
    );
  END LOOP;

  UPDATE orders SET inventory_reserved = TRUE WHERE id = target_order_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION reserve_order_inventory(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reserve_order_inventory(UUID) TO service_role;
