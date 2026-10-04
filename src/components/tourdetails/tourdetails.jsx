import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaXmark, FaLocationDot, FaMinus, FaPlus } from "react-icons/fa6";
import TourCard from "../tourcard/tourcard";
import SnapDots from "../snapdots/snapdots";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useInView } from "../../hooks/useInView";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/products";
import "../travhubbtn/travhubbtn.css";
import "./tourdetails.css";

import gallery1 from "../../assets/image/tour-gallery-1.jpg";
import gallery2 from "../../assets/image/tour-gallery-2.jpg";
import gallery3 from "../../assets/image/tour-gallery-3.jpg";
import gallery4 from "../../assets/image/tour-gallery-4.jpg";

const TEXT =
  "You’ve switched your charity’s office to renewable energy. You’ve cut most flights. The office fridge is stacked high with oat milk, and lycra-clad staff are proudly showing off their subsidised bicycles. On your way to net-zero, right? But operational emissions are just one part of the net-zero picture: your money, too, has a carbon cost attached.";

const TEXT_LONG =
  "Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget elementum acondimentum eget, diam. Nam at tortor in tellus interdum sagitliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. mavailable market standard dummy text available market industry Lorem Ipsum simply dummy text of free available market. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration";

const MEAL = "Breakfast, lunch, and dinner.";
const included = [MEAL, MEAL, MEAL, MEAL];
const excluded = ["Professional tour guide", MEAL, MEAL, MEAL];
const highlights = [MEAL, MEAL, MEAL, MEAL];

const itinerary = [
  "DAY 1 - Arrival and Orientation",
  "DAY 2 - Arrival and Orientation",
  "DAY 3 - Arrival and Orientation",
  "DAY 4 - Arrival and Orientation",
];

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4562.753041141002!2d-118.80123790098536!3d34.152323469614075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80e82469c2162619%3A0xba03efb7998eef6d!2sCostco+Wholesale!5e0!3m2!1sbn!2sbd!4v1562518641290!5m2!1sbn!2sbd";

/* ---------- Siyahı (✓ və ya ✕ ilə) ---------- */
function CheckList({ items, excluded = false }) {
  const Icon = excluded ? FaXmark : FaCheck;

  return (
    <ul className="tdet-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="tdet-list__icon" aria-hidden="true">
            <Icon />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Gün-gün plan: birinci açıq, klikləyəndə başqası açılır ---------- */
function Itinerary() {
  const [open, setOpen] = useState(0);

  return (
    <div className="tdet-itinerary">
      {itinerary.map((day, i) => {
        const isOpen = open === i;

        return (
          <div key={day} className={`tdet-itinerary__item${isOpen ? " is-active" : ""}`}>
            <h4 className="tdet-itinerary__heading">
              <button
                type="button"
                id={`tdet-day-${i}`}
                className="tdet-itinerary__title"
                aria-expanded={isOpen}
                aria-controls={`tdet-day-panel-${i}`}
                onClick={() => setOpen(i)}
              >
                <span className="tdet-itinerary__pin" aria-hidden="true">
                  <FaLocationDot />
                </span>
                {day}
                <span className="tdet-itinerary__icon" aria-hidden="true" />
              </button>
            </h4>

            <div
              id={`tdet-day-panel-${i}`}
              role="region"
              aria-labelledby={`tdet-day-${i}`}
              className="tdet-itinerary__panel"
              inert={!isOpen}
            >
              <div className="tdet-itinerary__panel-inner">
                <p>{TEXT}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- "Related Tour" – yana sürüşən 2 kart ----------
   Ən çox bəyənilən turlar (açıq olan tur çıxılır). Kartlarda endirim və
   "Featured" nişanı yoxdur (demo-dakı kimi). */
function RelatedTours({ currentId }) {
  const { tours } = useProducts({ limit: 4, sort: "popular" });
  const relatedTours = tours
    .filter((tour) => tour.id !== currentId)
    .slice(0, 3)
    .map((tour) => ({ ...tour, discount: null }));

  const { ref, pages, active, goTo } = useSnapScroll(relatedTours.length);

  if (!relatedTours.length) return null;

  return (
    <>
      <h3 className="tdet-related-title">Related Tour</h3>
      <div ref={ref} className="tdet-related snap-row">
        {relatedTours.map((tour) => (
          <TourCard key={tour.id} tour={tour} featured={false} />
        ))}
      </div>
      <SnapDots pages={pages} active={active} onSelect={goTo} label="Oxşar turlar" />
    </>
  );
}

/* ---------- Sağ tərəf: rezervasiya forması ---------- */
function Counter({ id, label, value, onChange, min, max }) {
  return (
    <div className="tdet-counter">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`${label}: azalt`}
      >
        <FaMinus />
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)));
        }}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`${label}: artır`}
      >
        <FaPlus />
      </button>
    </div>
  );
}

/*
  Hər yer (böyük və ya uşaq) turun qiymətinə hesablanır – backend-də bir qiymət var.
  "Booking Now" seçilmiş yerləri səbətə əlavə edir və Cart səhifəsinə aparır.
  Stokdan (qalan yer) çox seçmək olmur.
*/
function BookingForm({ tour }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const seatsLeft = tour.stock;
  const [adults, setAdults] = useState(Math.min(2, seatsLeft));
  const [children, setChildren] = useState(seatsLeft >= 3 ? 1 : 0);
  const [status, setStatus] = useState({ pending: false, error: "" });

  const seats = adults + children;
  const soldOut = seatsLeft === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setStatus({ pending: true, error: "" });
    try {
      await addItem(tour.id, seats);
      navigate("/cart");
    } catch (error) {
      setStatus({ pending: false, error: error.message });
    }
  };

  let buttonText = `Booking Now For ${formatPrice(tour.price * seats)}`;
  if (soldOut) buttonText = "Sold Out";
  else if (status.pending) buttonText = "Adding to cart...";

  return (
    <div className="tdet-booking">
      <h3 className="tdet-booking__title">Booking Form</h3>

      <form onSubmit={handleSubmit}>
        <ul className="tdet-booking__list">
          <li className="tdet-booking__row tdet-booking__row--price">
            <p className="tdet-booking__left">
              <span>Price</span>
              From
            </p>
            {formatPrice(tour.price)}
          </li>
          <li className="tdet-booking__row">
            <p className="tdet-booking__left">
              Availability
              <span>{soldOut ? "No seats left" : `${seatsLeft} seats left`}</span>
            </p>
          </li>
          <li className="tdet-booking__row">
            <p className="tdet-booking__left">
              Adults
              <span>Over 18 ( {formatPrice(tour.price)} )</span>
            </p>
            <Counter
              id="tdet-adults"
              label="Adults"
              value={adults}
              onChange={setAdults}
              min={soldOut ? 0 : 1}
              max={Math.max(seatsLeft - children, 0)}
            />
          </li>
          <li className="tdet-booking__row">
            <p className="tdet-booking__left">
              Children
              <span>Under 18 ( {formatPrice(tour.price)} )</span>
            </p>
            <Counter
              id="tdet-children"
              label="Children"
              value={children}
              onChange={setChildren}
              min={0}
              max={Math.max(seatsLeft - adults, 0)}
            />
          </li>
          <li className="tdet-booking__row tdet-booking__row--last">
            <p className="tdet-booking__left">
              Extra Services
              <span>Add extra services on your reservation</span>
            </p>
          </li>
        </ul>

        {/* əlavə xidmətlər backend-də hələ yoxdur – göstərilir, amma seçilmir */}
        <label className="tdet-check tdet-check--disabled">
          <input type="checkbox" name="health" disabled />
          <span className="tdet-check__box" aria-hidden="true" />
          Health Insurance ( $ 220 )
        </label>
        <label className="tdet-check tdet-check--disabled">
          <input type="checkbox" name="medical" disabled />
          <span className="tdet-check__box" aria-hidden="true" />
          Medical Insurance ( $ 45 )
        </label>
        <p className="tdet-booking__note">Extra services are not available for online booking yet.</p>

        {status.error && (
          <p className="tdet-booking__error" role="alert">
            {status.error}
          </p>
        )}

        <button
          type="submit"
          className="travhub-btn tdet-booking__submit"
          disabled={soldOut || status.pending || seats < 1}
        >
          <span>{buttonText}</span>
        </button>
      </form>
    </div>
  );
}

/* ---------- Bölmə ----------
   tour: backend-dən gələn məhsul (utils/products.js → toTour). Overview-da turun öz
   təsviri, qalan bölmələr (plan, qalereya, xəritə) şablondakı kimi qalır. */
export default function TourDetails({ tour }) {
  const [mainRef, mainInView] = useInView(0.05);
  const [asideRef, asideInView] = useInView(0.1);

  return (
    <section className="tour-details">
      <div className="tour-details__container">
        <div className="tour-details__row">
          <div ref={mainRef} className={`tour-details__main${mainInView ? " is-inview" : ""}`}>
            <img className="tour-details__image tour-details__image--cover" src={tour.image} alt={tour.title} />

            <h3 className="tdet-title">Overview</h3>
            <p className="tdet-text">{tour.description}</p>
            <p className="tdet-text">{TEXT_LONG}</p>

            <h3 className="tdet-title tdet-title--spaced">Included / Excluded</h3>
            <p className="tdet-text">{TEXT}</p>
            <div className="tdet-lists">
              <CheckList items={included} />
              <CheckList items={excluded} excluded />
            </div>

            <h3 className="tdet-title tdet-title--spaced">Top Highlights</h3>
            <p className="tdet-text">{TEXT}</p>
            <CheckList items={highlights} />

            <h3 className="tdet-title tdet-title--spaced">Gallery</h3>
            <p className="tdet-text">{TEXT}</p>
            <div className="tdet-gallery">
              {/* width/height: şəkil yüklənməmişdən əvvəl də yeri düzgün saxlanılsın */}
              <div className="tdet-gallery__col">
                <img src={gallery1} alt="Səyahətdən görüntü 1" width="200" height="186" loading="lazy" />
                <img src={gallery2} alt="Səyahətdən görüntü 2" width="200" height="185" loading="lazy" />
              </div>
              <div className="tdet-gallery__col">
                <img src={gallery3} alt="Səyahətdən görüntü 3" width="200" height="384" loading="lazy" />
              </div>
              <div className="tdet-gallery__col tdet-gallery__col--wide">
                <img src={gallery4} alt="Səyahətdən görüntü 4" width="424" height="384" loading="lazy" />
              </div>
            </div>

            <h3 className="tdet-title tdet-title--spaced">Itinerary</h3>
            <p className="tdet-text">{TEXT}</p>
            <Itinerary />

            <h3 className="tdet-title">See Map</h3>
            <p className="tdet-text">
              You’ve switched your charity’s office to renewable energy. You’ve cut most flights. The
              office fridge is stacked high with oat milk, and lycra-clad staff are proudly showing off
              their subsidised bicycles. On your way to net-zero.
            </p>
            <div className="tdet-map">
              <iframe title="Turun xəritəsi" src={MAP_URL} loading="lazy" allowFullScreen />
            </div>

            <RelatedTours currentId={tour.id} />
          </div>

          <aside ref={asideRef} className={`tour-details__aside${asideInView ? " is-inview" : ""}`}>
            {/* key: başqa tura keçəndə say seçimləri sıfırlansın */}
            <BookingForm key={tour.id} tour={tour} />
          </aside>
        </div>
      </div>
    </section>
  );
}
