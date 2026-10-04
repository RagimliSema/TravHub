import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authApi, productApi, onUnauthorized, tokenStorage } from "../services/api";

/*
  Giriş vəziyyəti bütün tətbiqdə buradan gəlir.
  - Səhifə açılanda token varsa /api/auth/me ilə yoxlanılır (istifadəçi + rolu backend-dən).
  - Token etibarsızdırsa (401) avtomatik çıxış edilir.
  - Wishlist: user.savedProducts – bəyənilən məhsulların id-ləri.
*/
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // token varsa, /me cavab verənə qədər "yoxlanılır" vəziyyəti
  const [loading, setLoading] = useState(() => !!tokenStorage.get());

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    if (!tokenStorage.get()) return;

    let cancelled = false;
    authApi
      .me()
      .then((data) => !cancelled && setUser(data.user))
      .catch(() => {
        // 401 olarsa onUnauthorized artıq çıxış edib; server işləmirsə istifadəçi sonra yenidən yoxlanacaq
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password, remember) => {
    const data = await authApi.login(email, password);
    tokenStorage.set(data.token, remember);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    tokenStorage.set(data.token, true);
    setUser(data.user);
    return data.user;
  }, []);

  // istifadəçini (və rolunu) backend-dən yenidən oxu – məs. Admin Panel-ə girərkən
  const refreshUser = useCallback(async () => {
    const data = await authApi.me();
    setUser(data.user);
    return data.user;
  }, []);

  // Google / Facebook girişi: backend-in verdiyi JWT saxlanılır, istifadəçi /me ilə yüklənir
  const loginWithToken = useCallback(
    async (token) => {
      tokenStorage.set(token, true);
      return refreshUser();
    },
    [refreshUser]
  );

  const isLiked = useCallback((productId) => !!user?.savedProducts?.includes(productId), [user]);

  // like / unlike – backend cavabına görə istifadəçinin siyahısı yenilənir
  const toggleLike = useCallback(async (productId) => {
    const data = await productApi.toggleLike(productId);
    setUser((prev) => {
      if (!prev) return prev;
      const others = prev.savedProducts.filter((id) => id !== productId);
      return { ...prev, savedProducts: data.liked ? [...others, productId] : others };
    });
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      // admin olub-olmamaq backend-in qaytardığı role-dan gəlir
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
      loginWithToken,
      isLiked,
      toggleLike,
    }),
    [user, loading, login, register, logout, refreshUser, loginWithToken, isLiked, toggleLike]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
