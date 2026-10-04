// Backend-in qəbul etdiyi sifariş statusları (backend/models/Order.js ilə eyni)
export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// bu statuslardan sonra backend dəyişikliyə icazə vermir
export const FINAL_STATUSES = ["Delivered", "Cancelled"];

// "6ac0...af4a54" → "#AF4A54"
export const orderNumber = (id) => `#${id.slice(-6).toUpperCase()}`;

// "2026-10-03T..." → "03 Oct 2026"
export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
