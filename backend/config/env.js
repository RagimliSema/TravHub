import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/*
  backend/.env faylını yükləyir (hansı qovluqdan işə salınmasından asılı olmayaraq).
  server.js-də ən birinci import olunur ki, sonra yüklənən bütün modullar
  process.env-i artıq dolu görsün.
*/
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

// bəzi hosting nümunələri MONGODB_URI adını işlədir – hər iki ad qəbul olunur
if (!process.env.MONGO_URI && process.env.MONGODB_URI) {
  process.env.MONGO_URI = process.env.MONGODB_URI;
}

// bunlarsız server düzgün işləyə bilməz – başlamazdan əvvəl yoxla
const REQUIRED = ["MONGO_URI", "JWT_SECRET", "JWT_EXPIRE"];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing environment variables in .env: ${missing.join(", ")}`);
  process.exit(1);
}

/*
  Production (deploy) üçün əlavə yoxlamalar – lokal development-ə təsir etmir:
  - CLIENT_URL yazılmalıdır, yoxsa CORS deploy olunmuş frontend-i bloklayar;
  - JWT_SECRET nümunədəki dəyər olmamalı və kifayət qədər uzun olmalıdır.
*/
if (process.env.NODE_ENV === "production") {
  const problems = [];

  if (!process.env.CLIENT_URL) {
    problems.push("CLIENT_URL must be set to the deployed frontend URL (e.g. https://your-app.vercel.app)");
  }
  if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith("change_this")) {
    problems.push("JWT_SECRET must be a long random string (at least 32 characters), not the example value");
  }

  if (problems.length) {
    console.error(`Production configuration error:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
}
