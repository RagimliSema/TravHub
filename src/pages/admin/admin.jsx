/*
  Admin Panel səhifələri – App.jsx-də "/admin" altında, RequireAdmin + AdminLayout ilə:
    /admin              → Dashboard
    /admin/products     → Products
    /admin/orders       → Orders
    /admin/users        → Users
    /admin/comments     → Bloq şərhləri
    /admin/messages     → Contact səhifəsindən gələn mesajlar
    /admin/subscribers  → Newsletter abunəçiləri
*/
export { default as AdminDashboard } from "./dashboard";
export { default as AdminProducts } from "./products";
export { default as AdminOrders } from "./orders";
export { default as AdminUsers } from "./users";
export { default as AdminComments } from "./comments";
export { default as AdminMessages } from "./messages";
export { default as AdminSubscribers } from "./subscribers";
