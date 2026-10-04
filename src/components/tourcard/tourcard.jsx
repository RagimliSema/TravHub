import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./tourcard.css";

/* ---------- İkonlar ---------- */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/*
  Tur kartı (ana səhifə, Tours səhifələri və Tour Details-dəki "Related Tour").
  featured = false → "Featured" nişanı görünmür (demo-da Related Tour kartlarında yoxdur).
  Endirim nişanı yalnız tour.discount varsa görünür.
  Ürək düyməsi backend-dəki wishlist-ə bağlıdır (giriş yoxdursa Login-ə aparır).
*/
export default function TourCard({ tour, featured = true }) {
  const { user, isLiked, toggleLike } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);

  const liked = isLiked(tour.id);
  const [dollars, cents] = tour.price.toFixed(2).split(".");
  const detailsUrl = `/tour-details/${tour.id}`;

  const handleLike = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    setPending(true);
    try {
      await toggleLike(tour.id);
    } catch {
      // alınmasa ürək əvvəlki vəziyyətində qalır
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="tour-card">
      <img className="tour-card__img" src={tour.image} alt={tour.title} loading="lazy" />

      {tour.discount && <span className="tour-card__discount">{tour.discount}</span>}

      <button
        type="button"
        className={`tour-card__like${liked ? " is-liked" : ""}`}
        onClick={handleLike}
        disabled={pending}
        aria-label={liked ? "Sevimlilərdən çıxar" : "Sevimlilərə əlavə et"}
        aria-pressed={liked}
      >
        <HeartIcon filled={liked} />
      </button>

      <div className="tour-card__body">
        {featured && <span className="tour-card__featured">Featured</span>}

        <h4 className="tour-card__price">
          ${dollars}
          <span>.{cents}</span>
        </h4>

        <div className="tour-card__title-row">
          <h3 className="tour-card__title">
            <Link to={detailsUrl}>{tour.title}</Link>
          </h3>

          <div className="tour-card__media">
            <a href="#" className="tour-card__media-btn" aria-label="Şəkillərə bax">
              <CameraIcon />
            </a>
            <a
              href={tour.videoUrl}
              className="tour-card__media-btn"
              target="_blank"
              rel="noreferrer"
              aria-label="Videoya bax"
            >
              <VideoIcon />
            </a>
          </div>
        </div>

        <ul className="tour-card__meta">
          <li>
            <span className="tour-card__rating">{tour.rating}</span>
            {tour.reviews} Rating
          </li>
          <li className="tour-card__divider" aria-hidden="true">|</li>
          <li>
            <PinIcon />
            {tour.location}
          </li>
        </ul>
      </div>
    </article>
  );
}
