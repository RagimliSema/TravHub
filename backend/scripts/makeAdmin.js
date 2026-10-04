/*
  Qeydiyyatdan keçmiş istifadəçini admin edir.
  İstifadə: npm run make-admin -- user@example.com

  Register həmişə "user" yaradır (təhlükəsizlik üçün), ona görə
  ilk admin bu skriptlə təyin olunur.
*/
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make-admin -- user@example.com");
  process.exit(1);
}

await connectDB();

const user = await User.findOne({ email });

if (!user) {
  console.error(`No user found with email: ${email}`);
  process.exitCode = 1;
} else {
  user.role = "admin";
  await user.save();
  console.log(`${user.name} (${user.email}) is now an admin`);
}

await mongoose.disconnect();
