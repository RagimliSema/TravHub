/*
  Lokal bazanı (MONGO_URI) MongoDB Atlas-a köçürür – mövcud məlumat (admin hesabı,
  şifrə hash-ləri, wishlist, səbət, sifarişlər, turlar) eyni _id-lərlə kopyalanır.

  1) backend/.env.migrate faylı yaradın (git-ə düşmür) və içinə Atlas ünvanını yazın:
       TARGET_MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/travhub?retryWrites=true&w=majority
  2) npm run copy-db              → yoxlama: nə kopyalanacağını göstərir, heç nə yazmır
  3) npm run copy-db -- --confirm → kopyalayır

  Təhlükəsizlik:
  - mənbə baza yalnız OXUNUR, heç nə silinmir və dəyişmir;
  - hədəf baza boş deyilsə kopyalama dayanır (orada olan məlumat üzərinə yazılmır);
  - bağlantı ünvanları və şifrələr ekrana yazılmır.
*/
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import "../config/env.js";
import mongoose from "mongoose";

dotenv.config({ path: fileURLToPath(new URL("../.env.migrate", import.meta.url)), quiet: true });

const COLLECTIONS = ["users", "products", "carts", "orders"];
const confirm = process.argv.includes("--confirm");

const sourceUri = process.env.MONGO_URI;
const targetUri = process.env.TARGET_MONGO_URI;

// ünvanı istifadəçi adı / şifrə olmadan göstər
const describe = (uri) => {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^/?]+)\/?([^?]*)/);
  return match ? `${match[1]}/${match[2] || "(default db)"}` : "(invalid URI)";
};

if (!targetUri) {
  console.error("TARGET_MONGO_URI is missing. Put it in backend/.env.migrate (see the comment at the top of this file).");
  process.exit(1);
}
if (targetUri === sourceUri) {
  console.error("Source and target are the same database – nothing to do.");
  process.exit(1);
}

const source = await mongoose.createConnection(sourceUri, { serverSelectionTimeoutMS: 10000 }).asPromise();
const target = await mongoose.createConnection(targetUri, { serverSelectionTimeoutMS: 15000 }).asPromise();

console.log(`source: ${describe(sourceUri)}`);
console.log(`target: ${describe(targetUri)}\n`);

// hədəf boş olmalıdır
const existing = {};
for (const name of COLLECTIONS) existing[name] = await target.collection(name).countDocuments();
const targetHasData = Object.values(existing).some((count) => count > 0);

const counts = {};
for (const name of COLLECTIONS) counts[name] = await source.collection(name).countDocuments();
console.table(COLLECTIONS.map((name) => ({ collection: name, "in source": counts[name], "already in target": existing[name] })));

if (targetHasData) {
  console.error("Target database is not empty – stopping so that nothing is overwritten.");
} else if (!confirm) {
  console.log("Dry run – nothing copied. Run again with --confirm to copy.");
} else {
  for (const name of COLLECTIONS) {
    const docs = await source.collection(name).find().toArray();
    if (docs.length) await target.collection(name).insertMany(docs, { ordered: true });
    console.log(`copied ${docs.length} ${name}`);
  }
  console.log("\nDone. Unique indexes (e.g. email) are created automatically when the backend starts.");
}

await source.close();
await target.close();
