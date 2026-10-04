/*
  Bazaya nümunə məhsullar yazır – TravHub-ın 9 turu (frontend-dəki tur kartları ilə eyni).
  İstifadə:
    npm run seed               → köhnə məhsulları silib bu 9 turu yazır
    npm run seed -- --destroy  → yalnız məhsulları silir

  Məhsullar silinəndə səbətlərdəki və wishlist-lərdəki köhnə məhsullar da təmizlənir.
  Sifarişlərə və istifadəçilərə toxunulmur.
*/
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";

const products = [
  {
    title: "Over Turkish Waves",
    description: "A relaxing coastal escape along the Turkish shoreline with boat trips, hidden bays and fresh seafood.",
    price: 385,
    category: "Beach",
    stock: 20,
    image: "tours-1-1.jpg",
    location: "Turkey",
    discount: 40,
  },
  {
    title: "Over Rome Waves",
    description: "Walk through ancient Rome: the Colosseum, Roman Forum and Vatican Museums with a local guide.",
    price: 395,
    category: "Culture",
    stock: 15,
    image: "tours-1-2.jpg",
    location: "Rome",
    discount: 60,
  },
  {
    title: "Over United Waves",
    description: "Sunny beaches, island hopping and snorkeling on the Florida coast.",
    price: 365,
    category: "Beach",
    stock: 25,
    image: "tours-1-3.jpg",
    location: "US, Florida",
    discount: 20,
  },
  {
    title: "Cape Town, South Africa",
    description: "Hike Table Mountain, visit the Cape of Good Hope and meet the penguins of Boulders Beach.",
    price: 245,
    category: "Adventure",
    stock: 12,
    image: "tours-1-4.jpg",
    location: "Cape Town",
    discount: 20,
  },
  {
    title: "New York City",
    description: "Times Square, Central Park, Brooklyn Bridge and a Broadway show in the city that never sleeps.",
    price: 548,
    category: "City",
    stock: 30,
    image: "tours-1-5.jpg",
    location: "New York",
    discount: 0,
  },
  {
    title: "Santiago, Chile",
    description: "Explore Santiago's old town, Andes viewpoints and the vineyards of the Maipo Valley.",
    price: 325,
    category: "City",
    stock: 18,
    image: "tours-1-6.jpg",
    location: "Chile",
    discount: 20,
  },
  {
    title: "Marrakech, Morocco",
    description: "Colorful souks, the Jemaa el-Fnaa square and a night under the stars in the desert.",
    price: 362,
    category: "Culture",
    stock: 16,
    image: "tours-1-7.jpg",
    location: "Morocco",
    discount: 0,
  },
  {
    title: "Great Barrier Reef",
    description: "Dive and snorkel among coral gardens and tropical fish in the world's largest reef system.",
    price: 253,
    category: "Nature",
    stock: 10,
    image: "tours-1-8.jpg",
    location: "Australia",
    discount: 0,
  },
  {
    title: "Bali, Indonesia",
    description: "Rice terraces, temples, waterfalls and beach sunsets on the Island of the Gods.",
    price: 658,
    category: "Beach",
    stock: 22,
    image: "tours-1-9.jpg",
    location: "Indonesia",
    discount: 20,
  },
];

const destroyOnly = process.argv.includes("--destroy");

await connectDB();

await Product.deleteMany({});
await Promise.all([
  Cart.updateMany({}, { $set: { items: [] } }),
  User.updateMany({}, { $set: { savedProducts: [] } }),
]);

if (destroyOnly) {
  console.log("All products removed");
} else {
  // tərsinə yazılır ki, "ən yeni birinci" sıralamada turlar bu siyahıdakı ardıcıllıqla görünsün
  await Product.insertMany([...products].reverse());
  console.log(`${products.length} products added`);
}

await mongoose.disconnect();
