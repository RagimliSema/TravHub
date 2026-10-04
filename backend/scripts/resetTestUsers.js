/*
  Test hesablarını silir – yalnız ADI ilə göstərilən email-ləri, əvvəlcə yalnız GÖSTƏRİR.

    npm run reset-test-users -- a@mail.com b@mail.com             → yoxlama (DRY RUN): heç nə silinmir
    npm run reset-test-users -- a@mail.com b@mail.com --confirm   → həqiqətən silir

  - Avtomatik testlərin qalıqları (@travhub.test) siyahıya özü əlavə olunur.
  - Qoruma: admin hesabları silinmir (yalnız --include-admins yazılsa).
  - Hər silinən istifadəçi üçün (Admin Panel-dəki "Delete user" kimi):
      səbəti silinir, bəyəndiyi turların likesCount-u 1 azalır.
  - Məhsullar, turlar və sifarişlər qalır (sifariş tarixçədə "Deleted user" kimi görünür).
*/
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");
const includeAdmins = args.includes("--include-admins");
const emails = args.filter((arg) => !arg.startsWith("--")).map((email) => email.trim().toLowerCase());

if (!emails.length) {
  console.log("Avtomatik test hesabları (@travhub.test) axtarılır. Başqa hesab üçün email-ləri yazın:");
  console.log("  npm run reset-test-users -- test1@mail.com test2@mail.com\n");
}

await connectDB();

const found = await User.find({ $or: [{ email: { $in: emails } }, { email: /@travhub\.test$/ }] }).select(
  "+password"
);

const notFound = emails.filter((email) => !found.some((user) => user.email === email));
const isProtected = (user) => user.role === "admin" && !includeAdmins;
const toDelete = found.filter((user) => !isProtected(user));
const protectedUsers = found.filter(isProtected);

// istifadəçi haqqında qısa məlumat (silinəcək / qalacaq məlumat)
const describe = async (user) => {
  const cart = await Cart.findOne({ user: user._id });
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    created: user.createdAt.toISOString().slice(0, 10),
    login: [user.password && "password", user.googleId && "google", user.facebookId && "facebook"]
      .filter(Boolean)
      .join("+"),
    wishlist: user.savedProducts.length,
    cartItems: cart?.items.length ?? 0,
    "orders (kept)": await Order.countDocuments({ user: user._id }),
  };
};

if (notFound.length) console.log(`Tapılmadı: ${notFound.join(", ")}\n`);

if (protectedUsers.length) {
  console.log("QORUNUR (admin – silinməyəcək):");
  console.table(await Promise.all(protectedUsers.map(describe)));
}

if (!toDelete.length) {
  console.log("Silinəcək hesab yoxdur.");
} else {
  console.log(confirm ? "SİLİNİR:" : "SİLİNƏCƏK (DRY RUN – hələ heç nə silinmədi):");
  console.table(await Promise.all(toDelete.map(describe)));

  if (!confirm) {
    console.log("Silmək üçün eyni komandanı sonuna --confirm əlavə edərək yenidən işlədin.");
  } else {
    for (const user of toDelete) {
      // bəyənmələr: məhsulun like sayı düzgün qalsın
      if (user.savedProducts.length) {
        await Product.updateMany(
          { _id: { $in: user.savedProducts }, likesCount: { $gt: 0 } },
          { $inc: { likesCount: -1 } }
        );
      }
      await Cart.deleteOne({ user: user._id });
      await user.deleteOne();
    }
    console.log(`${toDelete.length} hesab silindi. Məhsullar və sifarişlər toxunulmadı.`);
  }
}

await mongoose.disconnect();
