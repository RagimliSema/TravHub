import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";
import "./countersection.css";

import counter1 from "../../assets/image/count-1-1.jpg";
import counter2 from "../../assets/image/count-1-4.jpg";
import counter3 from "../../assets/image/count-1-2.jpg";
import counter4 from "../../assets/image/count-1-3.jpg";

const images = {
  big: counter1,
  circle: counter2,
  top: counter3,
  bottom: counter4,
};

const stats = [
  { value: 10, suffix: "k", label: "Our happy Customers around the word" },
  { value: 178, label: "Our happy Customers around the word" },
  { value: 24, suffix: "M", label: "Our happy Customers around the word" },
  { value: 125, label: "Our happy Customers around the word" },
];

const rating = { value: 4.8, decimals: 1 };

/*
  0-dan hədəfə qədər sayır (videodakı kimi: xətti, 1.5 saniyə).
  Sayarkən tam ədəd göstərir (4.8 üçün: 0,1,2,3,4), sonda dəqiq dəyər.
*/
function useCountUp(target, start, duration = 1500) {
  const [value, setValue] = useState(0);
  // "animasiyanı azalt" seçilibsə saymırıq – son rəqəm dərhal göstərilir
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!start || reduceMotion) return;

    let frame;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(progress < 1 ? Math.floor(progress * target) : target);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration, reduceMotion]);

  return start && reduceMotion ? target : value;
}

// Hər rəqəm özü ekrana girəndə saymağa başlayır
function Counter({ value, decimals = 0, suffix }) {
  const [ref, inView] = useInView(0.1);
  const current = useCountUp(value, inView);
  const finished = current === value;

  return (
    <span ref={ref} className="counter-number">
      <span className="sr-only">
        {value.toFixed(decimals)}
        {suffix}
      </span>
      <span aria-hidden="true">
        {finished ? value.toFixed(decimals) : current}
        {suffix && <small>{suffix}</small>}
      </span>
    </span>
  );
}

export default function CounterSection() {
  const [ref, inView] = useInView(0.1);

  return (
    <section className="counter-section">
      <div ref={ref} className={`counter-container${inView ? " is-inview" : ""}`}>
        {/* ---------- Şəkil kollajı ---------- */}
        <div className="counter-collage">
          <img className="counter-collage__img counter-collage__img--big" src={images.big} alt="Qayıq və qayalıq sahil" />
          <img className="counter-collage__img counter-collage__img--circle" src={images.circle} alt="Dənizə baxan şlyapalı qadın" />
          <img className="counter-collage__img counter-collage__img--top" src={images.top} alt="Tarixi kilsə" />
          <img className="counter-collage__img counter-collage__img--bottom" src={images.bottom} alt="Sahildə səyyah" />
        </div>

        {/* ---------- Rəqəmlər kartı ---------- */}
        <div className="counter-card">
          <span className="counter-card__line counter-card__line--top" aria-hidden="true" />
          <span className="counter-card__line counter-card__line--bottom" aria-hidden="true" />
          <span className="counter-card__line counter-card__line--left" aria-hidden="true" />
          <span className="counter-card__line counter-card__line--right" aria-hidden="true" />

          {stats.map((stat, i) => (
            <div className="counter-stat" key={i}>
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="counter-stat__label">{stat.label}</p>
            </div>
          ))}

          <div className="counter-rating">
            <Counter value={rating.value} decimals={rating.decimals} />
          </div>
        </div>
      </div>
    </section>
  );
}
