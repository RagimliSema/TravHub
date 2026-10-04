/*
  Backend məhsulunu frontend-in tur kartına uyğunlaşdırır.

  Şəkil: backend-də fayl adı saxlanılır ("tours-1-1.jpg"). Eyni adlı fayl
  src/assets/image/-dədir – Vite onu build zamanı öz URL-i ilə əvəz edir.
  Tam URL (https://...) gələrsə olduğu kimi istifadə olunur.
*/
const images = import.meta.glob("../assets/image/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const imageByName = Object.fromEntries(
  Object.entries(images).map(([path, url]) => [path.split("/").pop(), url])
);

// şəkil tapılmasa boz fon (sınıq şəkil ikonu görünməsin)
const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23f0f0f0'/></svg>";

// Admin forması üçün: seçilə bilən hazır foto adları (tur, destinasiya, qalereya şəkilləri)
export const productImageNames = Object.keys(imageByName)
  .filter((name) => /^(tours?|destination|gallery)-.*\.jpe?g$/.test(name))
  .sort();

export function getProductImage(image) {
  if (!image) return PLACEHOLDER;
  if (/^(https?:|data:|\/)/.test(image)) return image;
  return imageByName[image] ?? PLACEHOLDER;
}

// backend məhsulu → TourCard-ın gözlədiyi obyekt
export function toTour(product) {
  return {
    id: product._id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    likesCount: product.likesCount,
    image: getProductImage(product.image),
    discount: product.discount > 0 ? `${product.discount}% off` : null,
    location: product.location || product.category,
    // backend-də rəy sistemi yoxdur – reytinq şablondakı kimi statik qalır
    rating: "5.0",
    reviews: 245,
    videoUrl: "#",
  };
}

// 1234.5 → "$1,234.50"
export const formatPrice = (value) =>
  `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
