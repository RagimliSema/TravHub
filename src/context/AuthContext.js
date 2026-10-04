import { createContext, useContext } from "react";

// Daxil olmuş istifadəçi:
// { user, loading, isAdmin, login, register, logout, refreshUser, loginWithToken, isLiked, toggleLike }
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
