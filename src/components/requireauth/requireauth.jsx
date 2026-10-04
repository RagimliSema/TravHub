import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatusMessage from "../statusmessage/statusmessage";

/*
  Yalnız daxil olmuş istifadəçilər üçün səhifələr (Cart, Checkout, My Orders, Wishlist).
  Giriş yoxdursa Login-ə göndərir; girişdən sonra istifadəçi bura qayıdır.
  Əsl qoruma backend-dədir – bu yalnız istifadəçini düzgün səhifəyə yönləndirir.
*/
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <StatusMessage type="loading" text="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}
