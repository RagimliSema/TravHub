import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import "./scrolltotop.css";

// Halqanın uzunluğu (r = 49 olan dairə: 2 * π * 49)
const RING_LENGTH = 2 * Math.PI * 49;

/*
  Sağ aşağıdakı "yuxarı qalx" düyməsi (demo-dakı kimi):
  - səhifə bir ekran hündürlüyündən çox sürüşdürüləndə görünür
  - ətrafındakı yaşıl halqa səhifənin nə qədər oxunduğunu göstərir (0% → 100%)
  - klikləyəndə yumşaq şəkildə ən yuxarı qalxır
*/
export default function ScrollToTop() {
  const pathRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = null;

    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

      // halqanı birbaşa DOM-da yenilə (hər scroll-da React render etməsin)
      pathRef.current.style.strokeDashoffset = RING_LENGTH - progress * RING_LENGTH;
      setVisible(scrollY > window.innerHeight);
      frame = null;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <a
      href="#"
      className={`scroll-top${visible ? " is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Səhifənin yuxarısına qalx"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="scroll-top__ring" viewBox="-1 -1 102 102" aria-hidden="true">
        {/* yuxarıdan başlayıb saat əqrəbi istiqamətində dolur */}
        <path
          ref={pathRef}
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          style={{ strokeDasharray: `${RING_LENGTH} ${RING_LENGTH}`, strokeDashoffset: RING_LENGTH }}
        />
      </svg>
      <FaArrowUp className="scroll-top__icon" aria-hidden="true" />
    </a>
  );
}
