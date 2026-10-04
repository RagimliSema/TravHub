import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";
import "./clientcarousel.css";

import slack from "../../assets/image/client-2-1.png";
import hello from "../../assets/image/client-2-2.png";
import facebook from "../../assets/image/client-2-3.png";
import google from "../../assets/image/client-2-4.png";
import vanguard from "../../assets/image/client-2-5.png";
import dropbox from "../../assets/image/client-2-6.png";

const logos = [
  { src: slack, name: "Slack" },
  { src: hello, name: "Hello" },
  { src: facebook, name: "Facebook" },
  { src: google, name: "Google" },
  { src: vanguard, name: "Vanguard" },
  { src: dropbox, name: "Dropbox" },
];

// Sonsuz dövr üçün siyahının sonuna eyni loqolar bir daha əlavə olunur
const slides = [...logos, ...logos];

const AUTOPLAY = 5000; // hər 5 saniyədən bir sürüşür (demo-dakı kimi)
const SPEED = 500; // sürüşmə 0.5 saniyə çəkir

export default function ClientCarousel() {
  const [sectionRef, inView] = useInView(0.2);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  // Avtomatik sürüşmə
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      if (document.hidden) return;
      setAnimate(true);
      setIndex((i) => i + 1);
    }, AUTOPLAY);

    return () => clearInterval(id);
  }, []);

  // Sona (kopyalara) çatanda animasiyasız əvvələ qayıt – göz fərqi görmür
  useEffect(() => {
    if (index < logos.length) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, SPEED);
    return () => clearTimeout(id);
  }, [index]);

  // Qayıdışdan sonra animasiyanı yenidən aç
  useEffect(() => {
    if (animate) return;
    let inner;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animate]);

  return (
    <section ref={sectionRef} className={`client-carousel${inView ? " is-inview" : ""}`}>
      <div className="cc-container">
        <h5 className="cc-title">Trusted by 300K+ organizations worldwide</h5>

        <div className="cc-viewport">
          {/* sürüşmə məsafəsini CSS hesablayır (--index) – ekran ölçüsü dəyişəndə də dəqiqdir */}
          <ul
            className="cc-track"
            style={{
              "--index": index,
              transition: animate ? `transform ${SPEED}ms ease` : "none",
            }}
          >
            {slides.map((logo, i) => (
              <li
                key={i}
                className="cc-item"
                aria-hidden={i >= logos.length ? "true" : undefined}
              >
                <img src={logo.src} alt={i >= logos.length ? "" : logo.name} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
