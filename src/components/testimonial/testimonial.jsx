import { useInView } from "../../hooks/useInView";
import "./testimonial.css";

import test1 from "../../assets/image/test-1-1.jpg";
import test2 from "../../assets/image/test-1-2.jpg";
import test3 from "../../assets/image/test-1-3.jpg";
import test4 from "../../assets/image/test-1-4.jpg";
import test5 from "../../assets/image/test-1-5.jpg";

import arrowShape from "../../assets/image/test-1-shape.png";
import movingImage from "../../assets/image/page-header-bg-shape.png";

/* Kollajdakı şəkillər – sıra görünmə ardıcıllığıdır (hər birinə +120ms) */
const collage = [
  { src: test1, alt: "Dağda kürək çantalı səyyah", className: "tm-img--left" },
  { src: test2, alt: "Qayalıqda çəhrayı paltarlı qadın", className: "tm-img--top" },
  { src: test4, alt: "Hava limanında ailə", className: "tm-img--middle" },
  { src: test3, alt: "Göl kənarında iki səyyah", className: "tm-img--right" },
  { src: test5, alt: "Sahildə sarı paltarlı qadın", className: "tm-img--bottom" },
];

const testimonial = {
  text: "Travehub work helped us save a significant percentage of our tour plan we are happy with all experiences & all services.",
  name: "Tomas Widdin",
  role: "Web Developer",
};

// "66" formalı sitat ikonu
function QuoteIcon() {
  return (
    <svg width="38" height="27" viewBox="0 0 40 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="19" r="6" />
      <path d="M3 19C3 10 7 4 14 3" />
      <circle cx="29" cy="19" r="6" />
      <path d="M23 19C23 10 27 4 34 3" />
    </svg>
  );
}

export default function Testimonial() {
  const [collageRef, collageInView] = useInView(0.15);
  const [contentRef, contentInView] = useInView(0.2);

  return (
    <section className="testimonial">
      <div className="tm-container">
        {/* ---------- Şəkil kollajı ---------- */}
        <div ref={collageRef} className={`tm-collage${collageInView ? " is-inview" : ""}`}>
          {collage.map((img, i) => (
            <div
              key={img.className}
              className={`tm-img ${img.className}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <img src={img.src} alt={img.alt} />
            </div>
          ))}

          <img className="tm-arrow" src={arrowShape} alt="" aria-hidden="true" />
        </div>

        {/* ---------- Rəy ---------- */}
        <figure ref={contentRef} className={`tm-content${contentInView ? " is-inview" : ""}`}>
          <span className="tm-quote">
            <QuoteIcon />
          </span>

          <blockquote className="tm-text">{testimonial.text}</blockquote>

          <figcaption className="tm-author">
            <span className="tm-author__name">{testimonial.name}</span>
            <span className="tm-author__role">{testimonial.role}</span>
          </figcaption>
        </figure>
      </div>

      {/* ---------- Aşağıda sağa-sola yırğalanan şəhər siluetləri (hero-dakı kimi) ---------- */}
      <div className="tm-moving-wrap" aria-hidden="true">
        <img className="tm-moving" src={movingImage} alt="" />
      </div>
    </section>
  );
}
