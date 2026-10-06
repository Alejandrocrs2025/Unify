-- Checkout en el servidor: calcula precios, valida stock, canjea puntos, registra la venta
-- (una fila por unidad), descuenta stock y vacía el carrito, todo en UNA transacción.
-- Si ya habías creado una versión anterior con otra firma, se elimina para que no queden dos
DROP FUNCTION IF EXISTS public.place_order(text, integer, integer, text);

CREATE OR REPLACE FUNCTION public.place_order(
  p_payment_method text,
  p_address_id     integer DEFAULT NULL,
  p_points_blocks  int  DEFAULT 0,
  p_client_name    text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_cart       jsonb;
  v_ref        text;
  v_address    text;
  v_name       text;
  v_avatar     text;
  v_points     int;
  v_subtotal   numeric := 0;
  v_blocks     int := 0;
  v_discount   numeric := 0;
  v_total      numeric := 0;
  v_earned     int := 0;
  v_new_points int;
  v_bad        text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para comprar';
  END IF;
  IF p_payment_method IS NULL OR p_payment_method NOT IN ('card','paypal','transfer','cash') THEN
    RAISE EXCEPTION 'Método de pago no válido';
  END IF;

  -- Bloquea los productos del carrito mientras dura la compra (evita vender de más)
  PERFORM 1 FROM products p
  WHERE p.status = 'Activo'
    AND p.id IN (SELECT ci.product_id FROM cart_items ci WHERE ci.client_id = v_uid)
  FOR UPDATE;

  -- Carrito del usuario con precios y stock reales de la base de datos (solo productos activos)
  SELECT coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) INTO v_cart
  FROM (
    SELECT p.id AS product_id, p.seller_id, p.seller_name, p.title, p.image, p.category,
           p.price, coalesce(p.stock, 0) AS stock, sum(ci.quantity)::int AS qty
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id AND p.status = 'Activo'
    WHERE ci.client_id = v_uid AND ci.quantity > 0
    GROUP BY p.id, p.seller_id, p.seller_name, p.title, p.image, p.category, p.price, p.stock
  ) x;

  IF jsonb_array_length(v_cart) = 0 THEN
    RAISE EXCEPTION 'Tu carrito está vacío';
  END IF;

  SELECT string_agg(c.title, ', ') INTO v_bad
  FROM jsonb_to_recordset(v_cart) AS c(title text, stock int, qty int)
  WHERE c.stock < c.qty;
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'Stock insuficiente: %', v_bad;
  END IF;

  SELECT coalesce(round(sum(c.price * c.qty)::numeric, 2), 0) INTO v_subtotal
  FROM jsonb_to_recordset(v_cart) AS c(price double precision, qty int);

  -- Puntos: 100 puntos = $5 de descuento, sin pasar del total ni del saldo real
  SELECT coalesce(points, 0), full_name, avatar_url
    INTO v_points, v_name, v_avatar
  FROM profiles WHERE id = v_uid FOR UPDATE;
  v_points := coalesce(v_points, 0);

  v_blocks   := greatest(0, least(coalesce(p_points_blocks, 0), floor(v_points / 100.0)::int, floor(v_subtotal / 5)::int));
  v_discount := v_blocks * 5;
  v_total    := greatest(0, v_subtotal - v_discount);
  v_earned   := floor(v_total)::int;

  -- Dirección (debe ser del propio usuario)
  IF p_address_id IS NOT NULL THEN
    SELECT street || ', ' || city INTO v_address
    FROM addresses WHERE id = p_address_id AND client_id = v_uid::text;
    IF v_address IS NULL THEN
      RAISE EXCEPTION 'Dirección de entrega no válida';
    END IF;
  END IF;

  -- Referencia de pedido única
  LOOP
    v_ref := 'UNI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM sales WHERE order_ref = v_ref);
  END LOOP;

  -- Una fila por UNIDAD vendida
  INSERT INTO sales (order_ref, product_id, seller_id, product_title, product_image, company_name,
                     category, unit_price, payment_method, delivery_address, client_id,
                     client_name, avatar_url, status)
  SELECT v_ref, c.product_id, c.seller_id, c.title, c.image, c.seller_name,
         c.category, c.price, p_payment_method, v_address, v_uid,
         coalesce(v_name, nullif(trim(p_client_name), ''), 'Cliente'), v_avatar, 'Pendiente'
  FROM jsonb_to_recordset(v_cart) AS c(product_id uuid, seller_id uuid, seller_name text, title text,
                                       image text, category text, price double precision, qty int)
  CROSS JOIN LATERAL generate_series(1, c.qty);

  -- Descontar stock
  UPDATE products p SET stock = p.stock - c.qty
  FROM jsonb_to_recordset(v_cart) AS c(product_id uuid, qty int)
  WHERE p.id = c.product_id;

  -- Puntos (solo esta función puede cambiarlos; ver trigger de protección)
  v_new_points := v_points - v_blocks * 100 + v_earned;
  UPDATE profiles SET points = v_new_points WHERE id = v_uid;

  -- Vaciar carrito
  DELETE FROM cart_items WHERE client_id = v_uid;

  RETURN jsonb_build_object(
    'order_ref', v_ref,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total,
    'points_used', v_blocks * 100,
    'points_earned', v_earned,
    'points_balance', v_new_points,
    'delivery_address', v_address
  );
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, integer, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, integer, int, text) TO authenticated;
