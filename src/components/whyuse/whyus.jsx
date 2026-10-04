import { useEffect, useRef, useState } from "react";
import "./whyus.css";

/* ================================================================
   ŞƏKİLLƏR — hamısı src/image içindədir.
   Fayl adları səndəkindən fərqlidirsə, yalnız bu blokda dəyiş.
   (Komponent src/components/WhyChooseUs/ içində olduğu üçün yol ../../image/)
================================================================ */
import mainImg from "../../assets/image/why-choose-one-1.jpg"; // böyük şəkil (çantalı səyyah)
import ovalImg from "../../assets/image/why-choose-one-2.jpg"; // oval şəkil (qadın, dəniz)
import bgImg from "../../assets/image/why-choose-one-bg.png"; // sağdakı solğun palma fonu

import author1 from "../../assets/image/why-choose-one-author-1.jpg";
import author2 from "../../assets/image/why-choose-one-author-2.jpg";
import author3 from "../../assets/image/why-choose-one-author-3.jpg";


/* ======================= DATA ======================= */
const INTRO =
  "content of a page when looking at layout the point of using lorem the is Ipsum less";

const FEATURES = [
  {
    id: 1,
    icon: "suitcase",
    title: "Personalized Trips",
    text: "Content of a page when looking at layout the point of using lorem the is Ipsum less normal",
  },
  {
    id: 2,
    icon: "signpost",
    title: "Trusted Travel Guide",
    text: "Content of a page when looking at layout the point of using lorem the is Ipsum less normal",
  },
];

const AUTHORS = [
  { id: 1, img: author1, name: "Emily Carter" },
  { id: 2, img: author2, name: "Sofia Lane" },
  { id: 3, img: author3, name: "Daniel Brooks" },
];

/* ======================= İKONLAR ======================= */
const SuitcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5.5V3.8c0-.7.5-1.3 1.2-1.3h3.6c.7 0 1.2.6 1.2 1.3v1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="6" y="5.5" width="12" height="15" rx="2.2" fill="currentColor" />
    <path d="M10 9v8M14 9v8" stroke="#28ce9b" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8.5 20.5v1.2M15.5 20.5v1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SignpostIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="10.9" y="2.5" width="2.2" height="19" rx="1.1" fill="currentColor" />
    <path d="M9.9 6.5H5.2L3 8.6l2.2 2.1h4.7z" fill="currentColor" />
    <path d="M14.1 10.8h4.7l2.2 2.1-2.2 2.1h-4.7z" fill="currentColor" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 19L19 5M8.5 5H19v10.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const Sparkle = () => (
  <svg className="wcu__sparkle" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path className="wcu__sparkle-a" d="M4.5 2.5L9 12.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    <path className="wcu__sparkle-b" d="M17.5 1.5L12 12.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    <path className="wcu__sparkle-c" d="M14.5 17.5L21.5 16.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const ICONS = { suitcase: SuitcaseIcon, signpost: SignpostIcon };

/* ======================= HOOK-LAR ======================= */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* [data-reveal] olan hər elementə ekrana girəndə "is-in" class-ı əlavə edir */
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/* Element bir dəfə görünəndə true qaytarır */
function useInView(ref, threshold = 0.4) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}

/* Scroll etdikcə paraqrafın sözləri bir-bir "yanır" (videodakı effekt) */
function useScrollWords(ref, total) {
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setLit(total);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.92; // paraqraf ekranın altına girəndə başlayır
      const end = vh * 0.5; // ekranın ortasına çatanda tam dolur
      const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      setLit(Math.round(p * total));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, total]);
  return lit;
}

/* 0-dan hədəf rəqəmə qədər sayğac */
function CountUp({ end, suffix = "", duration = 2000, start }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setValue(end);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, end, duration]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}

/* ======================= KOMPONENT ======================= */
const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const textRef = useRef(null);
  const statsRef = useRef(null);

  const words = INTRO.split(" ");
  const litWords = useScrollWords(textRef, words.length);
  const statsInView = useInView(statsRef, 0.6);

  useReveal(sectionRef);

  /* Şəkil qrupunda mouse parallax (CSS dəyişənləri ilə, re-render olmadan) */
  const rafRef = useRef(0);
  const handleMouseMove = (e) => {
    const el = mediaRef.current;
    if (!el || prefersReducedMotion()) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // -0.5 … 0.5
    const y = (e.clientY - top) / height - 0.5;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    });
  };
  const handleMouseLeave = () => {
    const el = mediaRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.setProperty("--mx", 0);
    el.style.setProperty("--my", 0);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <section
      className="wcu"
      ref={sectionRef}
      aria-labelledby="wcu-title"
      style={{ "--wcu-bg-img": `url(${bgImg})` }}
    >

      <div className="wcu__container">
        {/* ---------- SOL: şəkillər ---------- */}
        <div
          className="wcu__media"
          ref={mediaRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg className="wcu__frame" data-reveal="fade" aria-hidden="true">
            <defs>
              {/* üst xətt yaşıl, sağ xətt boz (videodakı kimi) */}
              <linearGradient id="wcuFrameGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#28ce9b" />
                <stop offset="7%" stopColor="#28ce9b" />
                <stop offset="22%" stopColor="#9a9a9a" />
                <stop offset="100%" stopColor="#9a9a9a" />
              </linearGradient>
            </defs>
            <rect x="0.5" y="0.5" width="100%" height="100%" rx="24" />
          </svg>

          <div className="wcu__main" data-reveal="wipe">
            <img src={mainImg} alt="Dağlarda çantalı səyyah" />
          </div>

          <div className="wcu__oval-wrap" data-reveal="zoom" style={{ "--d": ".35s" }}>
            <div className="wcu__oval-parallax">
              <div className="wcu__oval">
                <img src={ovalImg} alt="Dəniz sahilində səyahət edən qadın" />
              </div>
            </div>
          </div>

          <div className="wcu__arrow-wrap" data-reveal="zoom" style={{ "--d": ".55s" }}>
            <a href="/about" className="wcu__arrow" aria-label="Haqqımızda ətraflı">
              <span className="wcu__arrow-ring" aria-hidden="true" />
              <span className="wcu__arrow-icon">
                <ArrowIcon />
              </span>
            </a>
          </div>

          <div className="wcu__trusted-wrap" data-reveal="left" style={{ "--d": ".7s" }}>
            <div className="wcu__trusted">
              <span className="wcu__trusted-check">
                <CheckIcon />
              </span>
              <div className="wcu__trusted-text">
                <strong>Trusted by</strong>
                <span>Trustpilot &amp; rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SAĞ: mətn ---------- */}
        <div className="wcu__content">
          <span className="wcu__subtitle" data-reveal="up">
            Why we are
            <Sparkle />
          </span>

          <h2 className="wcu__title" id="wcu-title" data-reveal="mask" style={{ "--d": ".1s" }}>
            <span>Why Choose Us</span>
          </h2>

          <p className="wcu__text" ref={textRef} aria-label={INTRO}>
            {words.map((word, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`wcu__word${i < litWords ? " is-lit" : ""}`}
              >
                {word}{" "}
              </span>
            ))}
          </p>

          <ul className="wcu__features">
            {FEATURES.map((f, i) => {
              const Icon = ICONS[f.icon];
              return (
                <li
                  key={f.id}
                  className="wcu__feature"
                  data-reveal="up"
                  style={{ "--d": `${0.15 + i * 0.15}s` }}
                >
                  <div className="wcu__feature-icon">
                    <span className="wcu__feature-box">
                      <Icon />
                    </span>
                  </div>
                  <div className="wcu__feature-body">
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="wcu__cta" data-reveal="up" style={{ "--d": ".2s" }}>
            <a href="/contact" className="wcu__btn">
              <span>Start Booking</span>
            </a>

            <div className="wcu__travellers" ref={statsRef}>
              <ul className="wcu__avatars">
                {AUTHORS.map((a, i) => (
                  <li
                    key={a.id}
                    className="wcu__avatar"
                    style={{ "--i": i }}
                    data-name={a.name}
                  >
                    <img src={a.img} alt={a.name} />
                  </li>
                ))}
                <li className="wcu__avatar wcu__avatar--plus" style={{ "--i": AUTHORS.length }}>
                  <a href="/contact" aria-label="Səyyahlara qoşul">
                    <PlusIcon />
                  </a>
                </li>
              </ul>

              <div className="wcu__stat">
                <strong>
                  <CountUp end={18} suffix="k+" start={statsInView} />
                </strong>
                <span>Individual Traveller</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;