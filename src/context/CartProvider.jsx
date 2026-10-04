import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./CartContext";
import { useAuth } from "./AuthContext";
import { cartApi } from "../services/api";

const EMPTY_CART = { items: [], totalItems: 0, totalPrice: 0 };

/*
  Səbət backend-də saxlanılır (hər istifadəçinin öz səbəti).
  Giriş edən kimi yüklənir, çıxışda boşalır. Header-dəki say da buradan gəlir.
*/
export default function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id ?? null;

  // userId: səbət kimin üçün yüklənib (başqa hesaba keçəndə köhnə səbət görünməsin)
  const [state, setState] = useState({ userId: null, cart: EMPTY_CART, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    cartApi
      .get()
      .then((data) => !cancelled && setState({ userId, cart: data.cart, error: null }))
      .catch((error) => !cancelled && setState({ userId, cart: EMPTY_CART, error: error.message }));

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  // xəta olanda "Try Again"
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, userId: null }));
    setAttempt((n) => n + 1);
  }, []);

  // backend hər əməliyyatdan sonra yenilənmiş səbəti qaytarır
  const apply = useCallback(
    async (requestPromise) => {
      const data = await requestPromise;
      setState({ userId, cart: data.cart, error: null });
      return data.cart;
    },
    [userId]
  );

  const addItem = useCallback((productId, quantity = 1) => apply(cartApi.add(productId, quantity)), [apply]);
  const updateItem = useCallback((productId, quantity) => apply(cartApi.update(productId, quantity)), [apply]);
  const removeItem = useCallback((productId) => apply(cartApi.remove(productId)), [apply]);
  const clear = useCallback(() => apply(cartApi.clear()), [apply]);

  // sifarişdən sonra backend səbəti özü boşaldır – burada da boş göstər
  const reset = useCallback(() => setState({ userId, cart: EMPTY_CART, error: null }), [userId]);

  const ready = !!userId && state.userId === userId;

  const value = useMemo(
    () => ({
      cart: ready ? state.cart : EMPTY_CART,
      loading: !!userId && !ready,
      error: ready ? state.error : null,
      addItem,
      updateItem,
      removeItem,
      clear,
      reset,
      refresh,
    }),
    [ready, state, userId, addItem, updateItem, removeItem, clear, reset, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
