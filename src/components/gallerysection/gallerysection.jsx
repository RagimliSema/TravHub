import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../sectiontitle/sectiontitle";
import "./gallerysection.css";

import gallery1 from "../../assets/image/gallery-1-1.jpg";
import gallery2 from "../../assets/image/gallery-1-2.jpg";
import gallery3 from "../../assets/image/gallery-1-6.jpg";
import gallery4 from "../../assets/image/gallery-1-3.jpg";
import gallery5 from "../../assets/image/gallery-1-4.jpg";
import gallery6 from "../../assets/image/gallery-1-7.jpg";
import gallery7 from "../../assets/image/gallery-1-5.jpg";
import gallery8 from "../../assets/image/gallery-1-8.jpg";
import gallery9 from "../../assets/image/gallery-1-12.jpg";
import gallery10 from "../../assets/image/gallery-1-9.jpg";
import gallery11 from "../../assets/image/gallery-1-10.jpg";
import gallery12 from "../../assets/image/gallery-1-11.jpg";

const photos = [
  {
    src: gallery1,
    alt: "Gülümsəyən cütlük",
    area: "a",
    size: "tall",
  },
  {
    src: gallery2,
    alt: "Kürək çantalı səyyah",
    area: "b",
  },
  {
    src: gallery3,
    alt: "Xəritəyə baxan cütlük",
    area: "c",
  },
  {
    src: gallery4,
    alt: "Dağ zirvəsində səyyah",
    area: "d",
    size: "tall",
  },
  {
    src: gallery5,
    alt: "Şəhərə baxan səyyah",
    area: "e",
  },
  {
    src: gallery6,
    alt: "Qayalıqda çəhrayı paltarlı qadın",
    area: "f",
  },
  {
    src: gallery7,
    alt: "Su üstündəki bunqalolar",
    area: "g",
    size: "tall",
  },
  {
    src: gallery8,
    alt: "Ada mənzərəsi qarşısında",
    area: "h",
  },
  {
    src: gallery9,
    alt: "Çamadanla gəzən cütlük",
    area: "i",
  },
  {
    src: gallery10,
    alt: "Qaya sahilində səyyah",
    area: "j",
    size: "tall",
  },
  {
    src: gallery11,
    alt: "Hava limanında ailə",
    area: "k",
    size: "big",
  },
  {
    src: gallery12,
    alt: "Sarı paltarlı qadın",
    area: "l",
    size: "tall",
  },
];

/* ---------- İkonlar ---------- */
const CameraIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
  </svg>
);

/* ---------- Böyük şəkil pəncərəsi (lightbox) ---------- */
function Lightbox({ index, onClose, onPrev, onNext }) {
  const closeRef = useRef(null);
  const photo = photos[index];

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.alt} onClick={onClose}>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        {/* key dəyişəndə şəkil yenidən animasiya ilə gəlir */}
        <img key={photo.src} className="lightbox__img" src={photo.src} alt={photo.alt} />
        <figcaption className="lightbox__caption">
          {index + 1} / {photos.length}
        </figcaption>
      </figure>

      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Bağla">
        ×
      </button>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Əvvəlki şəkil"
      >
        <Arrow dir="left" />
      </button>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Növbəti şəkil"
      >
        <Arrow dir="right" />
      </button>
    </div>
  );
}

/* ---------- Bölmə ----------
  page = true → Gallery səhifəsi ("/gallery"): başlıq yoxdur,
  altda "Load More Memories" düyməsi var (demo-dakı gallery-one--page).
*/
export default function GallerySection({ page = false }) {
  const [active, setActive] = useState(null); // açıq şəklin nömrəsi (yoxdursa null)

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + photos.length) % photos.length), []);
  const next = useCallback(() => setActive((i) => (i + 1) % photos.length), []);

  return (
    <section className={`gallery-section${page ? " gallery-section--page" : ""}`}>
      <div className="gallery-container">
        {!page && (
          <SectionTitle
            subtitle="Our beautiful moment"
            title="Recent Gallery"
            text="content of a page when looking at layout the point of using lorem the is Ipsum less"
          />
        )}

        <div className="gallery-grid">
          {photos.map((photo, i) => (
            <a
              key={photo.src}
              href={photo.src}
              className={`gallery-item gallery-item--${photo.area}${photo.size ? ` is-${photo.size}` : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setActive(i);
              }}
              aria-label={`${photo.alt} – böyüt`}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" />

              {/* hover-də yuxarıdan aşağı açılan yaşıl örtük */}
              <span className="gallery-item__overlay" aria-hidden="true">
                <span className="gallery-item__icon">
                  <CameraIcon />
                </span>
              </span>
            </a>
          ))}
        </div>

        {/* demo-da da bu düymə eyni səhifəyə aparır */}
        {page && (
          <div className="gallery-section__more">
            <Link to="/gallery" className="gallery-section__btn">
              <span>Load More Memories</span>
            </Link>
          </div>
        )}
      </div>

      {active !== null && <Lightbox index={active} onClose={close} onPrev={prev} onNext={next} />}
    </section>
  );
}
