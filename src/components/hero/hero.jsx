import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { productApi } from "../../services/api";
import "./hero.css";

/* ikonlar saytdakılara ən yaxın olanlardır */
import {
  FaLocationDot,
  FaCalendarDays,
  FaPersonWalkingLuggage,
  FaMagnifyingGlass,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { MdLuggage } from "react-icons/md";

import p1 from "../../assets/image/image-hero-1-1.png";
import p2 from "../../assets/image/image-hero-1-3.png";
import p3 from "../../assets/image/image-hero-1-2.png";
import p4 from "../../assets/image/image-hero-1-4.png";

import plane from "../../assets/image/plane.png";
import cloud from "../../assets/image/cloude-1-2.png";

import movingImage from "../../assets/image/page-header-bg-shape.png";


const topFloaters = [
  { src: p1, className: "float-oval float-oval--left", speed: 0.4 },
  { src: p2, className: "float-oval float-oval--right", speed: 0.4 },
];

const bottomFloaters = [
  { src: p3, className: "float-circle float-circle--left", speed: 0.29 },
  { src: p4, className: "float-circle float-circle--right", speed: 0.29 },
];

/* =========================================
   SEARCH DATA
========================================= */

const LOCATIONS = ["Australia", "Spain", "Africa", "Europe"];
const TYPES = ["Spain", "Beach", "Discovery"];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* =========================================
   SPLIT TEXT
   Mətni hərflərə bölür; hər hərf 0.02s fasilə ilə 1.2s-də görünür
   (demo-dakı GSAP SplitText animasiyası kimi)
========================================= */

function SplitChars({ lines, lineClass = "" }) {
  let index = 0;

  return (
    <>
      <span className="hero-sr">{lines.join(" ")}</span>
      <span aria-hidden="true">
        {lines.map((line, l) => (
          <span key={l}>
            {l > 0 && " "}
            <span className={lineClass}>
              {line.split(" ").map((word, w) => (
                <span key={w}>
                  {w > 0 && " "}
                  <span className="hero-word">
                    {[...word].map((char, c) => (
                      <span key={c} className="hero-char" style={{ "--i": index++ }}>
                        {char}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

/* =========================================
   DATE HELPERS
========================================= */

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();
const pad = (n) => String(n).padStart(2, "0");

// "9 Sep 26"
const formatShort = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;

// "09/23/2026"
const formatFooter = (d) =>
  `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;

// Ayın 6 həftəlik (42 xanalıq) cədvəli, bazar günündən başlayır
const getMonthCells = (month) => {
  const first = firstOfMonth(month);
  return Array.from(
    { length: 42 },
    (_, i) =>
      new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay() + i),
  );
};

export default function Hero() {
  const parallaxRefs = useRef([]);

  /* ---------- search state ---------- */
  const navigate = useNavigate();
  const [openField, setOpenField] = useState(null);
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [guests, setGuests] = useState("02");

  // "Location" və "Type" seçimləri bazadakı turlardan gəlir ki, hər seçim nəticə versin
  // (yüklənməsə əvvəlki siyahılar qalır)
  const [locations, setLocations] = useState(LOCATIONS);
  const [types, setTypes] = useState(TYPES);
  useEffect(() => {
    let cancelled = false;
    productApi
      .categories()
      .then((data) => !cancelled && data.categories.length && setTypes(data.categories))
      .catch(() => {});
    productApi
      .list({ limit: 50 })
      .then((data) => {
        const unique = [...new Set(data.products.map((product) => product.location).filter(Boolean))].sort();
        if (!cancelled && unique.length) setLocations(unique);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- date picker state ---------- */
  const [calView, setCalView] = useState(() => firstOfMonth(new Date()));
  const [tmpStart, setTmpStart] = useState(null);
  const [tmpEnd, setTmpEnd] = useState(null);
  const [hoverDay, setHoverDay] = useState(null);

  /* ---------- açılan menyunun yeri ---------- */
  // Menyu və təqvim document.body-yə çəkilir (portal), ona görə
  // heç bir bölmə onları örtə və ya kəsə bilmir
  const [popupPos, setPopupPos] = useState(null); // { top, left, width }
  const fieldRefs = useRef({});
  const popupRef = useRef(null);


  /* Scroll parallax: şəkillər səhifədən bir az tez yuxarı qalxır */
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let frame = null;

    const update = () => {
      const y = window.scrollY;
      parallaxRefs.current.forEach((el) => {
        if (!el) return;
        const speed = Number(el.dataset.speed) || 0;
        el.style.transform = `translate3d(0, ${-y * speed}px, 0)`;
      });
      frame = null;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  /* Kənara klik və ya Esc açıq menyunu / təqvimi bağlayır.
     Sahənin özünə və ya menyunun içinə klik bağlamır. */
  useEffect(() => {
    if (!openField) return;

    const onPointerDown = (e) => {
      const owner = fieldRefs.current[openField];
      const inField = owner && owner.contains(e.target);
      const inPopup = popupRef.current && popupRef.current.contains(e.target);
      if (!inField && !inPopup) setOpenField(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenField(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openField]);

  /* Menyunun yerini sahəyə görə hesabla (səhifə koordinatlarında) */
  const calcPopupPos = (name) => {
    const field = fieldRefs.current[name];
    if (!field) return null;
    const r = field.getBoundingClientRect();
    const cs = getComputedStyle(field);
    const pl = parseFloat(cs.paddingLeft) || 0; // menyu mətnlə eyni xətdən başlayır
    const listRight = parseFloat(cs.getPropertyValue("--list-right")) || 0;
    return {
      top: r.bottom + window.scrollY - 9, // saytdakı kimi paneldən 9px yuxarı
      left: r.left + window.scrollX + pl,
      width: name === "date" ? undefined : r.width - pl - listRight,
    };
  };

  /* Menyu ekrandan çıxırsa, içəri sürüşdür (xüsusən təqvim, kiçik ekranda) */
  useLayoutEffect(() => {
    const el = popupRef.current;
    if (!openField || !el || !popupPos) return;
    const w = el.offsetWidth;
    const minLeft = window.scrollX + 10;
    const maxLeft =
      window.scrollX + document.documentElement.clientWidth - 10 - w;
    const left = Math.max(minLeft, Math.min(popupPos.left, maxLeft));
    if (Math.abs(left - popupPos.left) > 0.5) {
      setPopupPos((p) => ({ ...p, left }));
    }
  }, [openField, popupPos]);

  /* Pəncərənin ölçüsü dəyişəndə menyunun yerini yenilə */
  useEffect(() => {
    if (!openField) return;
    const onResize = () => setPopupPos(calcPopupPos(openField));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [openField]);

  /* ---------- search handlers ---------- */

  const closeField = () => setOpenField(null);

  // Menyunu aç. Təqvim açılanda seçim hazırkı dəyərdən (yoxdursa bu gündən) başlayır
  const openMenu = (name) => {
    if (openField === name) return;

    if (name === "date") {
      const today = startOfDay(new Date());
      const start = dateRange ? dateRange.start : today;
      const end = dateRange ? dateRange.end : today;
      setTmpStart(start);
      setTmpEnd(end);
      setHoverDay(null);
      setCalView(firstOfMonth(start));
    }
    setPopupPos(calcPopupPos(name));
    setOpenField(name);
  };

  // Klik: bağlıdırsa açır, açıqdırsa bağlayır (demo-dakı kimi – hover ilə açılmır)
  const handleTriggerClick = (name) => {
    if (openField === name) closeField();
    else openMenu(name);
  };

  // 1-ci klik başlanğıcı, 2-ci klik sonu seçir
  const pickDay = (day) => {
    if (tmpStart && !tmpEnd && day >= tmpStart) {
      setTmpEnd(day);
    } else {
      setTmpStart(day);
      setTmpEnd(null);
    }
  };

  const applyDates = () => {
    setDateRange({ start: tmpStart, end: tmpEnd });
    closeField();
  };

  // Guests: 1–20 arası saxla
  const normalizeGuests = () => {
    const n = parseInt(guests, 10);
    if (Number.isNaN(n) || n < 1) setGuests("1");
    else if (n > 20) setGuests("20");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    closeField();

    // nəticələr Tour Sidebar səhifəsində: location → ad/məkan axtarışı, type → kateqoriya.
    // Tarix və qonaq sayı hələlik backend-də istifadə olunmur.
    const params = new URLSearchParams();
    if (location) params.set("search", location);
    if (type) params.set("category", type);

    const query = params.toString();
    navigate(query ? `/tours-sidebar?${query}` : "/tours-sidebar");
  };

  /* ---------- render helpers ---------- */

  // Açılan menyunu document.body-yə çək (portal)
  const renderPopup = (Tag, className, children, extraProps = {}) =>
    createPortal(
      <Tag
        ref={popupRef}
        className={`hero-popup ${className}`}
        style={{
          top: popupPos.top,
          left: popupPos.left,
          width: popupPos.width,
        }}
        {...extraProps}
      >
        {children}
      </Tag>,
      document.body,
    );

  const renderFloater = (f, i) => (
    <div
      key={f.className}
      ref={(el) => (parallaxRefs.current[i] = el)}
      data-speed={f.speed}
      className={`parallax ${f.className}`}
      aria-hidden="true"
    >
      <img src={f.src} alt="" />
    </div>
  );

  // Location və Type üçün açılan siyahı
  const renderSelect = ({
    name,
    label,
    icon,
    placeholder,
    options,
    value,
    onChange,
  }) => {
    const isOpen = openField === name;
    const allOptions = [{ text: placeholder, value: "" }].concat(
      options.map((o) => ({ text: o, value: o })),
    );

    return (
      <div
        ref={(el) => (fieldRefs.current[name] = el)}
        className={`search-field search-field--${name}${isOpen ? " is-open" : ""}`}
        data-field={name}
      >
        <button
          type="button"
          className="search-field-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => handleTriggerClick(name)}
        >
          <span className="search-field-top">
            <span className="search-field-label">{label}</span>
            <span className="search-field-icon">{icon}</span>
          </span>
          <span className="search-field-value">{value || placeholder}</span>
        </button>

        {isOpen &&
          popupPos &&
          renderPopup(
            "ul",
            "nice-list",
            allOptions.map((opt) => {
              const selected = opt.value === value;
              return (
                <li key={opt.text} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`nice-option${selected ? " is-selected" : ""}`}
                    onClick={() => {
                      onChange(opt.value);
                      closeField();
                    }}
                  >
                    {opt.text}
                  </button>
                </li>
              );
            }),
            { role: "listbox", "aria-label": label },
          )}
      </div>
    );
  };

  
  const previewEnd =
    tmpEnd || (tmpStart && hoverDay && hoverDay >= tmpStart ? hoverDay : null);

  // Təqvimdə bir ay
  const renderMonth = (month, side) => (
    <div className="drp-calendar" key={side}>
      <div className="drp-head">
        {side === "left" ? (
          <button
            type="button"
            className="drp-nav"
            aria-label="Previous month"
            onClick={() => setCalView(addMonths(calView, -1))}
          >
            <FaChevronLeft />
          </button>
        ) : (
          <span className="drp-nav-space" />
        )}

        <span className="drp-month">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>

        {side === "right" ? (
          <button
            type="button"
            className="drp-nav"
            aria-label="Next month"
            onClick={() => setCalView(addMonths(calView, 1))}
          >
            <FaChevronRight />
          </button>
        ) : (
          <span className="drp-nav-space" />
        )}
      </div>

      <div className="drp-grid" onMouseLeave={() => setHoverDay(null)}>
        {WEEK_DAYS.map((d) => (
          <span key={d} className="drp-dow">
            {d}
          </span>
        ))}

        {getMonthCells(month).map((day) => {
          const off = day.getMonth() !== month.getMonth();
          const isStart = !off && sameDay(day, tmpStart);
          const isEnd = !off && sameDay(day, previewEnd);
          const inRange =
            !off &&
            tmpStart &&
            previewEnd &&
            day > tmpStart &&
            day < previewEnd;

          const cls = [
            "drp-day",
            off && "is-off",
            inRange && "in-range",
            isStart && "is-start",
            isEnd && "is-end",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              type="button"
              key={day.getTime()}
              className={cls}
              onClick={() => pickDay(day)}
              onMouseEnter={() => setHoverDay(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="hero">
      {/* ===== DECORATIONS ==== */}
      <div className="hero-decor" aria-hidden="true">
        {topFloaters.map((f, i) => renderFloater(f, i))}
        
        <img className="anim-plane" src={plane} alt="" />
        <img className="anim-cloud cloud-right" src={cloud} alt="" />
      </div>

      {/* ===== TEXT ===== */}

      <div className="hero-content">
        {/* hərflər soldan gəlir */}
        <p className="hero-eyebrow hero-split hero-split--left">
          <SplitChars lines={["Welcome to Travlhub"]} />
        </p>

        {/* hərflər yuxarıdan düşür */}
        <h1 className="hero-title hero-split hero-split--down">
          <SplitChars
            lines={["Adventure &", "Experience The Travel"]}
            lineClass="title-line"
          />
        </h1>

        {/* hərflər soldan gəlir */}
        <p className="hero-desc hero-split hero-split--left">
          <SplitChars
            lines={[
              "The leap into electronic typesetting, remaining essentially",
              "unchanged. It was popularised, trust with our company",
            ]}
            lineClass="desc-line"
          />
        </p>
      </div>

      {/* ===== SEARCH ROW ===== */}

      <div className="search-row">
        {bottomFloaters.map((f, i) => renderFloater(f, i + topFloaters.length))}

        <form className="search-bar" onSubmit={handleSearch}>
          {/* LOCATION */}
          {renderSelect({
            name: "location",
            label: "Location",
            icon: <FaLocationDot />,
            placeholder: "Where to next",
            options: locations,
            value: location,
            onChange: setLocation,
          })}

          {/* TYPE */}
          {renderSelect({
            name: "type",
            label: "Type",
            icon: <MdLuggage />,
            placeholder: "Booking Type",
            options: types,
            value: type,
            onChange: setType,
          })}

          {/* DATE */}
          <div
            ref={(el) => (fieldRefs.current.date = el)}
            className={`search-field search-field--date${openField === "date" ? " is-open" : ""}`}
            data-field="date"
          >
            <button
              type="button"
              className="search-field-trigger"
              aria-haspopup="dialog"
              aria-expanded={openField === "date"}
              onClick={() => handleTriggerClick("date")}
            >
              <span className="search-field-top">
                <span className="search-field-label">Date From</span>
                <span className="search-field-icon">
                  <FaCalendarDays />
                </span>
              </span>
              <span className="search-field-value">
                {dateRange
                  ? `${formatShort(dateRange.start)} - ${formatShort(dateRange.end)}`
                  : "Select Date"}
              </span>
            </button>

            {openField === "date" &&
              tmpStart &&
              popupPos &&
              renderPopup(
                "div",
                "drp",
                <>
                  <div className="drp-calendars">
                    {renderMonth(calView, "left")}
                    {renderMonth(addMonths(calView, 1), "right")}
                  </div>

                  <div className="drp-foot">
                    <span className="drp-selected">
                      {formatFooter(tmpStart)} -{" "}
                      {tmpEnd ? formatFooter(tmpEnd) : ""}
                    </span>

                    <button
                      type="button"
                      className="drp-btn drp-btn--cancel"
                      onClick={closeField}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="drp-btn drp-btn--apply"
                      disabled={!tmpEnd}
                      onClick={applyDates}
                    >
                      Apply
                    </button>
                  </div>
                </>,
                { role: "dialog", "aria-label": "Select dates" },
              )}
          </div>

          {/* GUESTS —  */}
          <label className="search-field search-field--guests">
            <span className="search-field-top">
              <span className="search-field-label">Guests</span>
              <span className="search-field-icon">
                <FaPersonWalkingLuggage />
              </span>
            </span>
            <input
              className="search-field-value guest-input"
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              onBlur={normalizeGuests}
            />
          </label>

          {/* SEARCH – hover effekti tamamilə CSS-dədir (demo-dakı travhub-btn kimi) */}
          <button type="submit" className="search-submit">
            <span className="search-submit-text">
              Search
              <FaMagnifyingGlass />
            </span>
          </button>
        </form>
      </div>

      {/* ===== CITY SKYLINE ===== */}

      {/* fon şəkli kimi təkrarlanır və 20s-də sola gedib qayıdır (demo-dakı bgSlide) */}
      <div
        className="moving-image-wrap"
        style={{ backgroundImage: `url(${movingImage})` }}
        aria-hidden="true"
      />
    </section>
  );
}