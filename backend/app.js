import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

/*
  Express tətbiqi: middleware-lər, route-lar, xəta idarəsi.
  Serveri işə salmaq (DB + listen) server.js-dədir.
*/
const app = express();

/*
  Hosting-də (Render və s.) sorğular proxy-dən keçir. TRUST_PROXY=1 yazılanda
  Express istifadəçinin əsl IP-ni görür – rate limit hər istifadəçiyə ayrıca işləyir.
  Lokalda proxy yoxdur, dəyişən yazılmır.
*/
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

// təhlükəsizlik başlıqları (helmet "X-Powered-By: Express"-i də gizlədir)
app.use(helmet());

// hər sorğunu terminalda göstər – yalnız development-də
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// yalnız React (Vite) frontend-in ünvanından gələn sorğulara icazə ver.
// CLIENT_URL-də vergüllə bir neçə ünvan yazmaq olar (məs. lokal + deploy olunmuş sayt).
// Sondakı "/" silinir: "https://app.vercel.app/" da düzgün işləsin.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// server və baza işləyirmi – brauzerdə yoxlamaq üçün
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TravHub API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
