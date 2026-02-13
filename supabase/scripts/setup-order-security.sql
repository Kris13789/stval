-- Orders security and atomic place-order backend guard.
-- Run this in Supabase SQL Editor.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove any existing INSERT policy on orders to block direct client writes.
DO $$
DECLARE
  insert_policy record;
BEGIN
  FOR insert_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders;', insert_policy.policyname);
  END LOOP;
END;
$$;

-- Ensure authenticated users can still read orders only if whitelisted.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND policyname = 'orders_select_whitelisted'
  ) THEN
    CREATE POLICY orders_select_whitelisted
      ON public.orders
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.allowed_emails ae
          WHERE lower(ae.email) = lower(auth.jwt() ->> 'email')
        )
      );
  END IF;
END;
$$;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.orders FROM anon, authenticated;
GRANT SELECT ON TABLE public.orders TO authenticated;

-- Atomic backend operation that checks balance and inserts order in one transaction.
CREATE OR REPLACE FUNCTION public.place_order_secure(
  p_variant_id bigint,
  p_requester_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price numeric := 0;
  v_earned numeric := 0;
  v_spent numeric := 0;
  v_balance numeric := 0;
  v_inserted_order_id bigint;
  v_inserted_created_at timestamptz;
BEGIN
  IF p_requester_email IS NULL OR btrim(p_requester_email) = '' THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.allowed_emails ae
    WHERE lower(ae.email) = lower(p_requester_email)
  ) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  -- Global lock for single-wallet setup; avoids concurrent double-spend.
  PERFORM pg_advisory_xact_lock(hashtext('orders_global_balance_lock'));

  SELECT greatest(coalesce(p.price, 0), 0)
  INTO v_price
  FROM public.variants v
  JOIN public.products p ON p.id = v.product_id
  WHERE v.id = p_variant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VARIANT_NOT_FOUND';
  END IF;

  SELECT coalesce(sum(greatest(coalesce(t.hearts, 0), 0)), 0)
  INTO v_earned
  FROM public.tasks t
  WHERE t.status = 'approved';

  SELECT coalesce(sum(greatest(coalesce(p.price, 0), 0)), 0)
  INTO v_spent
  FROM public.orders o
  JOIN public.variants v ON v.id = o.variant_id
  JOIN public.products p ON p.id = v.product_id;

  v_balance := greatest(v_earned - v_spent, 0);

  IF v_balance < v_price THEN
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE';
  END IF;

  INSERT INTO public.orders (variant_id)
  VALUES (p_variant_id)
  RETURNING id, created_at
  INTO v_inserted_order_id, v_inserted_created_at;

  RETURN jsonb_build_object(
    'order_id', v_inserted_order_id,
    'created_at', v_inserted_created_at,
    'charged', v_price,
    'balance_before', v_balance,
    'balance_after', greatest(v_balance - v_price, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.place_order_secure(bigint, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order_secure(bigint, text) TO service_role;
