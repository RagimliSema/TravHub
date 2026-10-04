import { useInView } from "../../hooks/useInView";
import "./sectiontitle.css";

// Mətni hərflərə bölür; hər hərf öz gecikməsi ilə görünür.
// Mətndəki "\n" yeni sətir deməkdir (məs. FAQ: "Some Question\nAbout Us").
function SplitText({ text, delay = 0, stagger = 25 }) {
  let index = 0;

  return (
    <>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true">
        {text.split("\n").map((line, l) => (
          <span key={l}>
            {l > 0 && <br />}
            {line.split(" ").map((word, w) => (
              <span key={w}>
                {w > 0 && " "}
                <span className="split-word">
                  {[...word].map((char, c) => (
                    <span
                      key={c}
                      className="split-char"
                      style={{ transitionDelay: `${delay + index++ * stagger}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </>
  );
}

/*
  Bölmə başlığı: kiçik əl yazısı + böyük başlıq + alt mətn.
  Ekrana girəndə:
    - kiçik yazı hərf-hərf sağdan gəlir
    - böyük başlıq hərf-hərf soldan gəlir (100ms sonra)
    - alt mətn hərf-hərf aşağıdan qalxır (300ms sonra, daha sıx)
*/
export default function SectionTitle({ subtitle, title, text, align = "center" }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`section-title${align === "left" ? " section-title--left" : ""}${inView ? " is-inview" : ""}`}
    >
      {/* kiçik əl yazısı istəyə bağlıdır (məs. Pricing-dəki "Included In All Plans"-da yoxdur) */}
      {subtitle && (
        <span className="section-title__subtitle">
          <SplitText text={subtitle} />
          <svg className="section-title__mark" viewBox="0 0 30 30" aria-hidden="true">
            <path d="M9 3 L13 17" />
            <path d="M24 2 L17 17" />
            <path d="M28 19 L20 22" />
          </svg>
        </span>
      )}

      <h2 className="section-title__heading">
        <SplitText text={title} delay={100} />
      </h2>

      {text && (
        <p className="section-title__text">
          <SplitText text={text} delay={300} stagger={12} />
        </p>
      )}
    </div>
  );
}
