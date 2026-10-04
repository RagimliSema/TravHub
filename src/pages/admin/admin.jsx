/*
  Admin Panel səhifələri – App.jsx-də "/admin" altında, RequireAdmin + AdminLayout ilə:
    /admin            → Dashboard
    /admin/products   → Products
    /admin/orders     → Orders
    /admin/users      → Users
*/
export { default as AdminDashboard } from "./dashboard";
export { default as AdminProducts } from "./products";
export { default as AdminOrders } from "./orders";
export { default as AdminUsers } from "./users";
