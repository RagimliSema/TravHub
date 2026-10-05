/*
  Backend API ilə bütün əlaqə buradan keçir.
  Ünvan VITE_API_URL-dən gəlir (build zamanı kodun içinə yazılır):
    lokal:   .env → VITE_API_URL=http://localhost:5000/api
    deploy:  hosting-in Environment Variables bölməsi → VITE_API_URL=https://your-api.onrender.com/api
  Yazılmayıbsa: development-də lokal backend, production-da eyni domendəki /api.
*/
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl && import.meta.env.PROD) {
  console.error("VITE_API_URL is not set for this build – set it in your hosting settings and redeploy.");
}

const API_URL = (configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")).replace(
  /\/+$/,
  ""
);
const TOKEN_KEY = "travhub_token";

/* ---------- JWT token ----------
   "Remember Me" seçilibsə localStorage (brauzer bağlansa da qalır),
   seçilməyibsə sessionStorage (tab bağlananda silinir). */
const storages = () => [window.localStorage, window.sessionStorage];

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token, remember = true) {
    this.clear();
    try {
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    } catch {
      // gizli rejimdə yaddaş bağlı ola bilər – token yalnız bu səhifədə qalmır
    }
  },
  clear() {
    try {
      storages().forEach((storage) => storage.removeItem(TOKEN_KEY));
    } catch {
      // yaddaş bağlıdırsa silinəcək bir şey də yoxdur
    }
  },
};

/* ---------- Xəta ---------- */
export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// token etibarsız olanda (vaxtı keçib, istifadəçi silinib) AuthProvider çıxış edir
let unauthorizedHandler = null;
export const onUnauthorized = (handler) => {
  unauthorizedHandler = handler;
};

/* ---------- Əsas sorğu funksiyası ----------
   auth: false → token göndərilmir (login / register). */
export async function request(path, { method = "GET", body, auth = true, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? tokenStorage.get() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Cannot reach the server. Please make sure the backend is running.", 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) unauthorizedHandler?.();
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status, data.errors);
  }
  return data;
}

// { search: "rome", page: 2, category: "" } → "?search=rome&page=2"
const toQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  const query = new URLSearchParams(entries).toString();
  return query ? `?${query}` : "";
};

/* ---------- Endpoint-lər ---------- */
export const authApi = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password }, auth: false }),
  me: () => request("/auth/me"),
  // hansı sosial girişlər serverdə qurulub: { providers: { google, facebook }, emailConfigured }
  providers: () => request("/auth/providers", { auth: false }),
  // şifrə sıfırlama: email-ə link → linkdəki token ilə yeni şifrə
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (token, password) =>
    request(`/auth/reset-password/${encodeURIComponent(token)}`, { method: "POST", body: { password }, auth: false }),
};

// Google / Facebook girişi brauzerin özü ilə backend-ə keçid kimi başlayır (fetch yox)
export const oauthUrl = (provider, from) => `${API_URL}/auth/${provider}${toQuery({ from })}`;

export const productApi = {
  list: (params, signal) => request(`/products${toQuery(params)}`, { signal }),
  categories: () => request("/products/categories"),
  get: (id, signal) => request(`/products/${id}`, { signal }),
  toggleLike: (id) => request(`/products/${id}/like`, { method: "POST" }),
};

export const wishlistApi = {
  list: (signal) => request("/wishlist", { signal }),
};

export const cartApi = {
  get: () => request("/cart"),
  add: (productId, quantity) => request("/cart", { method: "POST", body: { productId, quantity } }),
  update: (productId, quantity) => request(`/cart/${productId}`, { method: "PUT", body: { quantity } }),
  remove: (productId) => request(`/cart/${productId}`, { method: "DELETE" }),
  clear: () => request("/cart", { method: "DELETE" }),
};

export const orderApi = {
  create: (body) => request("/orders", { method: "POST", body }),
  mine: (signal) => request("/orders/my-orders", { signal }),
};

// bloq şərhləri: oxumaq hamıya açıqdır, yazmaq / silmək üçün giriş lazımdır
export const commentApi = {
  list: (post, signal) => request(`/comments${toQuery({ post })}`, { signal }),
  create: (post, text, parent) => request("/comments", { method: "POST", body: { post, text, parent } }),
  remove: (id) => request(`/comments/${id}`, { method: "DELETE" }),
};

// Contact formu – giriş tələb etmir
export const contactApi = {
  send: (body) => request("/contact", { method: "POST", body, auth: false }),
};

// Footer-dəki Newsletter formu – giriş tələb etmir
export const newsletterApi = {
  subscribe: (email) => request("/newsletter", { method: "POST", body: { email }, auth: false }),
};

/* ---------- Admin Panel ----------
   Bu sorğular yalnız admin tokeni ilə uğurlu olur – backend protect + admin
   middleware-i ilə yoxlayır, adi istifadəçi 403 alır. */
export const adminApi = {
  createProduct: (data) => request("/products", { method: "POST", body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: "PUT", body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  orders: (params, signal) => request(`/orders${toQuery(params)}`, { signal }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: "PUT", body: { status } }),

  users: (signal) => request("/users", { signal }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

  comments: (signal) => request("/comments/all", { signal }),
  deleteComment: (id) => request(`/comments/${id}`, { method: "DELETE" }),

  messages: (signal) => request("/contact", { signal }),
  deleteMessage: (id) => request(`/contact/${id}`, { method: "DELETE" }),

  subscribers: (signal) => request("/newsletter", { signal }),
  deleteSubscriber: (id) => request(`/newsletter/${id}`, { method: "DELETE" }),
};
