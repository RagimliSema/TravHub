/*
  Controller-lərin ortaq istifadə etdiyi kiçik köməkçi funksiyalar.
*/

// obyektdən yalnız icazə verilən sahələri götürür: pick(req.body, ["title", "price"])
// (istifadəçi "likesCount", "role" kimi sahələri özü təyin edə bilməsin)
export const pick = (source, keys) => {
  const data = source ?? {};
  return Object.fromEntries(
    keys.filter((key) => data[key] !== undefined).map((key) => [key, data[key]])
  );
};

// axtarış mətnindəki ".", "*", "(" kimi simvollar RegExp əmri yox, adi simvol kimi işləsin
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// MongoDB id formatı: 24 simvollu hex mətn
export const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

// query parametrini müsbət tam ədədə çevirir (?page=2), alınmasa fallback qaytarır
export const toPositiveInt = (value, fallback) => {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

// qiyməti 2 rəqəmə yuvarlaqlaşdırır: 10.005 → 10.01
export const roundPrice = (value) => Math.round(value * 100) / 100;

// frontend-in ünvanı (CLIENT_URL-də vergüllə bir neçə ünvan ola bilər – birincisi)
export const clientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");
