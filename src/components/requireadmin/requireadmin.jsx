import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatusMessage from "../statusmessage/statusmessage";

/*
  Admin Panel-in qapısı.
  - Giriş yoxdursa → Login (girişdən sonra bura qayıdır).
  - Girərkən rol backend-dən (/api/auth/me) YENİDƏN oxunur – brauzerdə saxlanmış
    köhnə məlumata etibar edilmir.
  - Rol "admin" deyilsə → /unauthorized.
  Bu yalnız istifadəçini düzgün səhifəyə aparır; əsl qoruma backend-dədir
  (admin olmayan tokenlə admin sorğuları 403 alır).
*/
export default function RequireAdmin({ children }) {
  const { user, loading, refreshUser } = useAuth();
  const location = useLocation();
  const userId = user?._id;
  const [verifiedFor, setVerifiedFor] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    refreshUser()
      .catch(() => {
        // 401 → AuthProvider artıq çıxış edib; şəbəkə xətasında backend yenə qoruyur
      })
      .finally(() => !cancelled && setVerifiedFor(userId));

    return () => {
      cancelled = true;
    };
  }, [userId, refreshUser]);

  if (loading) {
    return <StatusMessage type="loading" text="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (verifiedFor !== userId) {
    return <StatusMessage type="loading" text="Checking admin access..." />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
}
