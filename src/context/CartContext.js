import { createContext, useContext } from "react";

// Səbət: { cart, loading, error, addItem, updateItem, removeItem, clear, reset, refresh }
export const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);
