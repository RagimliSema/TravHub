import "./setup.js"; // ən birinci: test bazasını seçir
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { devOutbox } from "../utils/sendEmail.js";

/*
  Bütün API-nin avtomatik testi: npm test
  Real MongoDB lazımdır (MONGO_URI_TEST bazası). Testlər ardıcıl işləyir –
  əvvəlki addımın yaratdığı istifadəçi/məhsul sonrakı addımda istifadə olunur.
*/

let server;
let baseUrl;

// API-yə sorğu göndərib { status, body } qaytarır
const api = async (method, path, { token, body } = {}) => {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const register = (name, email) =>
  api("POST", "/api/auth/register", { body: { name, email, password: "secret123" } });

const shippingAddress = {
  fullName: "Ali Aliyev",
  phone: "+994501234567",
  address: "Nizami 10",
  city: "Baku",
  country: "Azerbaijan",
};

// testlər arasında paylaşılan məlumat
const ctx = {};

before(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000, autoIndex: false });
  } catch (error) {
    throw new Error(`MongoDB is not reachable at MONGO_URI_TEST (${error.message}). Start MongoDB and try again.`, {
      cause: error,
    });
  }
  await mongoose.connection.dropDatabase();
  // unique index-lər (məs. email) təmiz bazada yenidən yaradılır
  await Promise.all(Object.values(mongoose.models).map((model) => model.createIndexes()));

  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
});

describe("Health & 404", () => {
  it("GET /api/health reports the database as connected", async () => {
    const res = await api("GET", "/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.database, "connected");
  });

  it("unknown route returns 404 JSON", async () => {
    const res = await api("GET", "/api/does-not-exist");
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("Auth", () => {
  it("registers a user, hashes the password and hides it", async () => {
    const res = await register("Ali", "ali@mail.com");
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, "user");
    assert.equal(res.body.user.password, undefined);

    const stored = await User.findOne({ email: "ali@mail.com" }).select("+password");
    assert.match(stored.password, /^\$2[aby]\$10\$/);
    ctx.userToken = res.body.token;
    ctx.userId = res.body.user._id;
  });

  it("ignores role sent by the client", async () => {
    const res = await api("POST", "/api/auth/register", {
      body: { name: "Hacker", email: "hacker@mail.com", password: "secret123", role: "admin" },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, "user");
  });

  it("rejects a duplicate email (case-insensitive) with 409", async () => {
    const res = await register("Ali 2", "ALI@Mail.com");
    assert.equal(res.status, 409);
  });

  it("returns validation errors with 400", async () => {
    const res = await api("POST", "/api/auth/register", {
      body: { name: "X", email: "not-an-email", password: "123" },
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.length >= 2);
  });

  it("login: wrong password → 401, correct → token", async () => {
    const wrong = await api("POST", "/api/auth/login", {
      body: { email: "ali@mail.com", password: "wrong-pass" },
    });
    assert.equal(wrong.status, 401);

    const ok = await api("POST", "/api/auth/login", {
      body: { email: "ali@mail.com", password: "secret123" },
    });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.token);
  });

  it("login rejects NoSQL-injection objects", async () => {
    const res = await api("POST", "/api/auth/login", { body: { email: { $ne: null }, password: "x" } });
    assert.equal(res.status, 400);
  });

  it("/me: no token → 401, forged token → 401, valid token → user", async () => {
    assert.equal((await api("GET", "/api/auth/me")).status, 401);
    assert.equal((await api("GET", "/api/auth/me", { token: "abc.def.ghi" })).status, 401);

    const res = await api("GET", "/api/auth/me", { token: ctx.userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, "ali@mail.com");
  });

  it("creates an admin for the next tests", async () => {
    const res = await register("Admin", "admin@mail.com");
    await User.updateOne({ email: "admin@mail.com" }, { role: "admin" });
    ctx.adminToken = res.body.token;
  });
});

describe("Products", () => {
  const tour = {
    title: "Bali, Indonesia",
    description: "Rice terraces and temples",
    price: 658,
    category: "Beach",
    stock: 5,
    image: "tours-1-9.jpg",
    location: "Indonesia",
    discount: 20,
  };

  it("normal user cannot create a product (403)", async () => {
    const res = await api("POST", "/api/products", { token: ctx.userToken, body: tour });
    assert.equal(res.status, 403);
  });

  it("admin creates products; likesCount cannot be set by the client", async () => {
    const res = await api("POST", "/api/products", {
      token: ctx.adminToken,
      body: { ...tour, likesCount: 999 },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.product.likesCount, 0);
    ctx.productId = res.body.product._id;

    const second = await api("POST", "/api/products", {
      token: ctx.adminToken,
      body: { title: "New York City", description: "City tour", price: 548, category: "City", stock: 3 },
    });
    assert.equal(second.status, 201);
    ctx.product2Id = second.body.product._id;
  });

  it("rejects invalid product data with 400", async () => {
    const res = await api("POST", "/api/products", {
      token: ctx.adminToken,
      body: { description: "No title", price: -5, category: "Beach", stock: 1.5, discount: 150 },
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.length >= 4);
  });

  it("lists products with search, filters, sorting and pagination", async () => {
    const all = await api("GET", "/api/products");
    assert.equal(all.status, 200);
    assert.equal(all.body.total, 2);

    const search = await api("GET", "/api/products?search=bali");
    assert.equal(search.body.total, 1);

    // axtarış məkana görə də işləyir
    const byLocation = await api("GET", "/api/products?search=indonesia");
    assert.equal(byLocation.body.products[0].title, "Bali, Indonesia");
    assert.equal(byLocation.body.products[0].discount, 20);

    const category = await api("GET", "/api/products?category=city");
    assert.equal(category.body.products[0].title, "New York City");

    const price = await api("GET", "/api/products?minPrice=600");
    assert.equal(price.body.total, 1);

    const sorted = await api("GET", "/api/products?sort=price_asc");
    assert.deepEqual(sorted.body.products.map((p) => p.price), [548, 658]);

    const paged = await api("GET", "/api/products?limit=1&page=2");
    assert.equal(paged.body.count, 1);
    assert.equal(paged.body.pages, 2);
  });

  it("returns categories", async () => {
    const res = await api("GET", "/api/products/categories");
    assert.deepEqual(res.body.categories, ["Beach", "City"]);
  });

  it("single product: found / invalid id / missing", async () => {
    assert.equal((await api("GET", `/api/products/${ctx.productId}`)).status, 200);
    assert.equal((await api("GET", "/api/products/abc")).status, 400);
    assert.equal((await api("GET", "/api/products/65f000000000000000000000")).status, 404);
  });

  it("admin updates a product; invalid stock is rejected", async () => {
    const res = await api("PUT", `/api/products/${ctx.productId}`, {
      token: ctx.adminToken,
      body: { price: 600 },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.product.price, 600);
    assert.equal(res.body.product.title, tour.title);

    const bad = await api("PUT", `/api/products/${ctx.productId}`, {
      token: ctx.adminToken,
      body: { stock: -1 },
    });
    assert.equal(bad.status, 400);
  });
});

describe("Wishlist (like)", () => {
  it("requires login", async () => {
    assert.equal((await api("POST", `/api/products/${ctx.productId}/like`)).status, 401);
  });

  it("toggles like on and off and keeps likesCount in sync", async () => {
    const on = await api("POST", `/api/products/${ctx.productId}/like`, { token: ctx.userToken });
    assert.equal(on.status, 200);
    assert.equal(on.body.liked, true);
    assert.equal(on.body.likesCount, 1);

    const list = await api("GET", "/api/wishlist", { token: ctx.userToken });
    assert.equal(list.body.count, 1);
    assert.equal(list.body.products[0]._id, ctx.productId);

    const off = await api("POST", `/api/products/${ctx.productId}/like`, { token: ctx.userToken });
    assert.equal(off.body.liked, false);
    assert.equal(off.body.likesCount, 0);
  });
});

describe("Cart", () => {
  it("starts empty", async () => {
    const res = await api("GET", "/api/cart", { token: ctx.userToken });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.cart.items, []);
    assert.equal(res.body.cart.totalPrice, 0);
  });

  it("adds products and increases quantity of an existing item", async () => {
    await api("POST", "/api/cart", { token: ctx.userToken, body: { productId: ctx.productId, quantity: 2 } });
    const res = await api("POST", "/api/cart", { token: ctx.userToken, body: { productId: ctx.productId } });
    assert.equal(res.status, 200);
    assert.equal(res.body.cart.items[0].quantity, 3);
    assert.equal(res.body.cart.totalPrice, 1800);
  });

  it("checks stock and input", async () => {
    const tooMany = await api("POST", "/api/cart", {
      token: ctx.userToken,
      body: { productId: ctx.productId, quantity: 10 },
    });
    assert.equal(tooMany.status, 400);

    const zero = await api("POST", "/api/cart", {
      token: ctx.userToken,
      body: { productId: ctx.productId, quantity: 0 },
    });
    assert.equal(zero.status, 400);

    const badId = await api("POST", "/api/cart", { token: ctx.userToken, body: { productId: "abc" } });
    assert.equal(badId.status, 400);
  });

  it("updates quantity, removes an item and clears the cart", async () => {
    const updated = await api("PUT", `/api/cart/${ctx.productId}`, {
      token: ctx.userToken,
      body: { quantity: 1 },
    });
    assert.equal(updated.body.cart.items[0].quantity, 1);

    const notInCart = await api("PUT", `/api/cart/${ctx.product2Id}`, {
      token: ctx.userToken,
      body: { quantity: 1 },
    });
    assert.equal(notInCart.status, 404);

    await api("POST", "/api/cart", { token: ctx.userToken, body: { productId: ctx.product2Id } });
    const removed = await api("DELETE", `/api/cart/${ctx.productId}`, { token: ctx.userToken });
    assert.equal(removed.body.cart.items.length, 1);

    const cleared = await api("DELETE", "/api/cart", { token: ctx.userToken });
    assert.equal(cleared.body.cart.totalItems, 0);
  });
});

describe("Orders", () => {
  it("cannot order with an empty cart", async () => {
    const res = await api("POST", "/api/orders", { token: ctx.userToken, body: { shippingAddress } });
    assert.equal(res.status, 400);
  });

  it("creates an order from the cart: price from DB, stock decreases, cart is emptied", async () => {
    await api("POST", "/api/cart", { token: ctx.userToken, body: { productId: ctx.productId, quantity: 2 } });

    const res = await api("POST", "/api/orders", { token: ctx.userToken, body: { shippingAddress } });
    assert.equal(res.status, 201);
    assert.equal(res.body.order.totalPrice, 1200);
    assert.equal(res.body.order.status, "Pending");
    assert.equal(res.body.order.orderItems[0].title, "Bali, Indonesia");
    ctx.orderId = res.body.order._id;

    assert.equal((await Product.findById(ctx.productId)).stock, 3);
    assert.equal((await Cart.findOne({ user: ctx.userId })).items.length, 0);
  });

  it("rejects a missing shipping address without touching stock", async () => {
    const res = await api("POST", "/api/orders", {
      token: ctx.userToken,
      body: { orderItems: [{ product: ctx.productId, quantity: 1 }] },
    });
    assert.equal(res.status, 400);
    assert.equal((await Product.findById(ctx.productId)).stock, 3);
  });

  it("all-or-nothing: if one item lacks stock, no stock changes", async () => {
    const res = await api("POST", "/api/orders", {
      token: ctx.userToken,
      body: {
        shippingAddress,
        orderItems: [
          { product: ctx.productId, quantity: 1 },
          { product: ctx.product2Id, quantity: 99 },
        ],
      },
    });
    assert.equal(res.status, 400);
    assert.equal((await Product.findById(ctx.productId)).stock, 3);
    assert.equal((await Product.findById(ctx.product2Id)).stock, 3);
  });

  it("creates a direct order (buy now) with orderItems", async () => {
    const res = await api("POST", "/api/orders", {
      token: ctx.userToken,
      body: { shippingAddress, orderItems: [{ product: ctx.product2Id, quantity: 1 }] },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.order.totalPrice, 548);
  });

  it("lists my orders and protects single orders from other users", async () => {
    const mine = await api("GET", "/api/orders/my-orders", { token: ctx.userToken });
    assert.equal(mine.body.count, 2);

    const other = await register("Leyla", "leyla@mail.com");
    ctx.otherToken = other.body.token;
    ctx.otherId = other.body.user._id;

    assert.equal((await api("GET", `/api/orders/${ctx.orderId}`, { token: ctx.userToken })).status, 200);
    assert.equal((await api("GET", `/api/orders/${ctx.orderId}`, { token: ctx.otherToken })).status, 403);
    assert.equal((await api("GET", `/api/orders/${ctx.orderId}`, { token: ctx.adminToken })).status, 200);
  });

  it("only admin sees all orders", async () => {
    assert.equal((await api("GET", "/api/orders", { token: ctx.userToken })).status, 403);

    const res = await api("GET", "/api/orders", { token: ctx.adminToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.orders[0].user.email, "ali@mail.com");
  });

  it("order keeps the price it was bought for", async () => {
    await api("PUT", `/api/products/${ctx.productId}`, { token: ctx.adminToken, body: { price: 999 } });
    const res = await api("GET", `/api/orders/${ctx.orderId}`, { token: ctx.userToken });
    assert.equal(res.body.order.orderItems[0].price, 600);
  });

  it("admin changes status; cancelling returns stock; final states are locked", async () => {
    const bad = await api("PUT", `/api/orders/${ctx.orderId}/status`, {
      token: ctx.adminToken,
      body: { status: "Lost" },
    });
    assert.equal(bad.status, 400);

    const userTry = await api("PUT", `/api/orders/${ctx.orderId}/status`, {
      token: ctx.userToken,
      body: { status: "Shipped" },
    });
    assert.equal(userTry.status, 403);

    const shipped = await api("PUT", `/api/orders/${ctx.orderId}/status`, {
      token: ctx.adminToken,
      body: { status: "Shipped" },
    });
    assert.equal(shipped.body.order.status, "Shipped");

    const cancelled = await api("PUT", `/api/orders/${ctx.orderId}/status`, {
      token: ctx.adminToken,
      body: { status: "Cancelled" },
    });
    assert.equal(cancelled.status, 200);
    assert.equal((await Product.findById(ctx.productId)).stock, 5);

    const locked = await api("PUT", `/api/orders/${ctx.orderId}/status`, {
      token: ctx.adminToken,
      body: { status: "Pending" },
    });
    assert.equal(locked.status, 400);
  });
});

describe("Admin: users and cleanup", () => {
  it("normal user cannot list users", async () => {
    assert.equal((await api("GET", "/api/users", { token: ctx.userToken })).status, 403);
  });

  it("admin sees a user with their order history", async () => {
    const res = await api("GET", `/api/users/${ctx.userId}`, { token: ctx.adminToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.password, undefined);
    assert.equal(res.body.orders.length, 2);
  });

  it("deleting a product removes it from wishlists and carts", async () => {
    await api("POST", `/api/products/${ctx.product2Id}/like`, { token: ctx.otherToken });
    await api("POST", "/api/cart", { token: ctx.otherToken, body: { productId: ctx.product2Id } });

    const res = await api("DELETE", `/api/products/${ctx.product2Id}`, { token: ctx.adminToken });
    assert.equal(res.status, 200);

    assert.equal((await api("GET", "/api/wishlist", { token: ctx.otherToken })).body.count, 0);
    assert.equal((await api("GET", "/api/cart", { token: ctx.otherToken })).body.cart.items.length, 0);
  });

  it("deleting a user also deletes their cart; admins cannot be deleted", async () => {
    await api("POST", "/api/cart", { token: ctx.otherToken, body: { productId: ctx.productId } });

    const res = await api("DELETE", `/api/users/${ctx.otherId}`, { token: ctx.adminToken });
    assert.equal(res.status, 200);
    assert.equal(await Cart.exists({ user: ctx.otherId }), null);
    assert.equal((await api("GET", "/api/auth/me", { token: ctx.otherToken })).status, 401);

    const adminUser = await User.findOne({ email: "admin@mail.com" });
    const self = await api("DELETE", `/api/users/${adminUser._id}`, { token: ctx.adminToken });
    assert.equal(self.status, 400);
  });
});

describe("Social login (OAuth)", () => {
  const realFetch = globalThis.fetch;
  const googleProfile = { sub: "google-123", email: "gina@gmail.com", email_verified: true, name: "Gina Google" };

  // yalnız Google ünvanlarına gedən sorğular saxta cavab alır – əsl Google-a heç nə getmir
  before(() => {
    globalThis.fetch = async (url, options) => {
      const href = String(url);
      if (href.startsWith("https://oauth2.googleapis.com/token")) {
        return Response.json({ access_token: "test-access-token" });
      }
      if (href.startsWith("https://openidconnect.googleapis.com/")) {
        return Response.json(googleProfile);
      }
      return realFetch(url, options);
    };
  });

  after(() => {
    globalThis.fetch = realFetch;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  // yönləndirməni izləmədən cavabı oxu
  const raw = (path, headers = {}) => realFetch(baseUrl + path, { redirect: "manual", headers });
  const hashParams = (res) => new URLSearchParams(new URL(res.headers.get("location")).hash.slice(1));

  // giriş axınını başlat: Google ünvanı, state və cookie qaytarır
  const start = async (query = "") => {
    const res = await raw(`/api/auth/google${query}`);
    const location = new URL(res.headers.get("location"));
    return { res, location, state: location.searchParams.get("state"), cookie: res.headers.get("set-cookie")?.split(";")[0] };
  };

  it("without credentials: providers are off and login is refused (no fake login)", async () => {
    const providers = await api("GET", "/api/auth/providers");
    assert.deepEqual(providers.body.providers, { google: false, facebook: false });

    const res = await raw("/api/auth/google");
    assert.equal(res.status, 302);
    assert.match(hashParams(res).get("error"), /not configured/);
    assert.equal(hashParams(res).get("token"), null);
  });

  it("redirects to Google with client id, redirect URI and a random state", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

    const { location, state, cookie } = await start("?from=/cart");
    assert.equal(location.origin + location.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
    assert.equal(location.searchParams.get("client_id"), "test-client-id");
    assert.equal(location.searchParams.get("redirect_uri"), "http://localhost:5000/api/auth/google/callback");
    assert.equal(location.searchParams.get("response_type"), "code");
    assert.ok(state.length >= 32);
    assert.match(cookie, /^travhub_oauth=/);
    ctx.oauth = { state, cookie };
  });

  it("rejects a callback whose state does not match the cookie", async () => {
    const res = await raw("/api/auth/google/callback?code=abc&state=wrong", { Cookie: ctx.oauth.cookie });
    assert.match(hashParams(res).get("error"), /invalid/i);
    assert.equal(hashParams(res).get("token"), null);
  });

  it("creates a password-less user and returns a working JWT", async () => {
    const res = await raw(`/api/auth/google/callback?code=abc&state=${ctx.oauth.state}`, {
      Cookie: ctx.oauth.cookie,
    });
    const params = hashParams(res);
    assert.equal(params.get("from"), "/cart");

    const me = await api("GET", "/api/auth/me", { token: params.get("token") });
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, "gina@gmail.com");
    assert.equal(me.body.user.role, "user");
    assert.equal(me.body.user.googleId, undefined); // cavabda görünmür

    const stored = await User.findOne({ email: "gina@gmail.com" }).select("+password");
    assert.equal(stored.password, undefined); // saxta şifrə saxlanmır
    assert.equal(stored.googleId, "google-123");

    // şifrəsiz hesaba şifrə ilə giriş: 401 (server xətası yox)
    const login = await api("POST", "/api/auth/login", { body: { email: "gina@gmail.com", password: "anything123" } });
    assert.equal(login.status, 401);
  });

  it("links Google to an existing account only when the email is verified", async () => {
    // təsdiqlənməmiş email → birləşdirilmir
    Object.assign(googleProfile, { sub: "google-999", email: "admin@mail.com", email_verified: false });
    let flow = await start();
    let res = await raw(`/api/auth/google/callback?code=abc&state=${flow.state}`, { Cookie: flow.cookie });
    assert.match(hashParams(res).get("error"), /verify/i);

    // təsdiqlənmiş email → mövcud hesaba (Ali) bağlanır, şifrəsi qalır
    Object.assign(googleProfile, { sub: "google-456", email: "ali@mail.com", email_verified: true });
    flow = await start();
    res = await raw(`/api/auth/google/callback?code=abc&state=${flow.state}`, { Cookie: flow.cookie });
    const me = await api("GET", "/api/auth/me", { token: hashParams(res).get("token") });
    assert.equal(me.body.user._id, ctx.userId);

    const stored = await User.findById(ctx.userId).select("+password");
    assert.equal(stored.googleId, "google-456");
    assert.ok(stored.password);
  });
});

describe("Password reset", () => {
  const forgot = (email) => api("POST", "/api/auth/forgot-password", { body: { email } });
  // test mühitində məktub göndərilmir – devOutbox-dan linkdəki tokeni götürürük
  const tokenFromOutbox = () => devOutbox.at(-1).text.match(/\/reset-password\/([a-f0-9]{64})/)[1];

  it("answers the same for unknown emails and sends nothing", async () => {
    const before = devOutbox.length;
    const res = await forgot("nobody@mail.com");
    assert.equal(res.status, 200);
    assert.match(res.body.message, /If an account with that email exists/);
    assert.equal(devOutbox.length, before);
  });

  it("sends a one-time link and stores only a hash of the token", async () => {
    const res = await forgot("ALI@mail.com");
    assert.equal(res.status, 200);
    assert.equal(devOutbox.at(-1).to, "ali@mail.com");

    ctx.resetToken = tokenFromOutbox();
    const stored = await User.findById(ctx.userId).select("+passwordResetToken +passwordResetExpires");
    assert.notEqual(stored.passwordResetToken, ctx.resetToken); // bazada açıq token yoxdur
    assert.match(stored.passwordResetToken, /^[a-f0-9]{64}$/);
    const minutesLeft = (stored.passwordResetExpires - Date.now()) / 60000;
    assert.ok(minutesLeft > 14 && minutesLeft <= 15);
  });

  it("rejects a wrong token and a too-short password (the link stays usable)", async () => {
    const wrong = await api("POST", `/api/auth/reset-password/${"0".repeat(64)}`, {
      body: { password: "newsecret123" },
    });
    assert.equal(wrong.status, 400);

    const short = await api("POST", `/api/auth/reset-password/${ctx.resetToken}`, { body: { password: "123" } });
    assert.equal(short.status, 400);
    assert.match(short.body.message, /at least 8/);
  });

  it("sets the new password, ends old sessions and cannot be reused", async () => {
    const before = await api("POST", "/api/auth/login", { body: { email: "ali@mail.com", password: "secret123" } });
    assert.equal(before.status, 200);
    await new Promise((resolve) => setTimeout(resolve, 1100)); // JWT vaxtı saniyə dəqiqliyindədir

    const res = await api("POST", `/api/auth/reset-password/${ctx.resetToken}`, { body: { password: "brandnew123" } });
    assert.equal(res.status, 200);

    // köhnə sessiya və köhnə şifrə artıq işləmir
    assert.equal((await api("GET", "/api/auth/me", { token: before.body.token })).status, 401);
    const oldPassword = await api("POST", "/api/auth/login", { body: { email: "ali@mail.com", password: "secret123" } });
    assert.equal(oldPassword.status, 401);

    // yeni şifrə işləyir və yeni token qəbul olunur
    const login = await api("POST", "/api/auth/login", { body: { email: "ali@mail.com", password: "brandnew123" } });
    assert.equal(login.status, 200);
    assert.equal((await api("GET", "/api/auth/me", { token: login.body.token })).status, 200);

    const stored = await User.findById(ctx.userId).select("+password +passwordResetToken");
    assert.match(stored.password, /^\$2[aby]\$10\$/); // bcrypt hash, açıq mətn yox
    assert.equal(stored.passwordResetToken, undefined);

    const reuse = await api("POST", `/api/auth/reset-password/${ctx.resetToken}`, { body: { password: "another123" } });
    assert.equal(reuse.status, 400);
  });

  it("rejects an expired link", async () => {
    await forgot("ali@mail.com");
    const token = tokenFromOutbox();
    await User.updateOne({ _id: ctx.userId }, { passwordResetExpires: new Date(Date.now() - 1000) });

    const res = await api("POST", `/api/auth/reset-password/${token}`, { body: { password: "expired123" } });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /expired/);
  });

  it("keeps admin login and password-less Google accounts working", async () => {
    const admin = await api("POST", "/api/auth/login", { body: { email: "admin@mail.com", password: "secret123" } });
    assert.equal(admin.status, 200);
    assert.equal((await api("GET", "/api/users", { token: admin.body.token })).status, 200);

    const google = await api("POST", "/api/auth/login", { body: { email: "gina@gmail.com", password: "whatever123" } });
    assert.equal(google.status, 401);

    const providers = await api("GET", "/api/auth/providers");
    assert.equal(providers.body.emailConfigured, false);
  });
});
