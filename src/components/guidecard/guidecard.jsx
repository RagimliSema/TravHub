import { useInView } from "../../hooks/useInView";
import "./guidecard.css";

/* ---------- Sosial ikonlar ---------- */
const socials = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: <path d="M23 5.5c-.8.4-1.7.6-2.6.7.9-.6 1.6-1.4 2-2.5-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.5 4.2a4.5 4.5 0 0 0 1.4 6 4.4 4.4 0 0 1-2-.6v.1c0 2.2 1.5 4 3.6 4.4-.7.2-1.4.2-2 .1.6 1.8 2.2 3.1 4.2 3.1A9 9 0 0 1 1 19.2 12.8 12.8 0 0 0 7.9 21c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.7-1.4 2.3-2.1z" />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: <path d="M5 8.5H1.5V22H5V8.5zM3.3 2.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM22.5 14.3c0-3.6-.8-6.1-5-6.1-2 0-3.3.7-3.9 1.8V8.5H10V22h3.5v-6.7c0-1.8.3-3.4 2.5-3.4s2.2 2 2.2 3.5V22h3.5l.8-7.7z" />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.3" cy="6.7" r="1.2" />
      </>
    ),
  },
];

/*
  Bələdçi kartı (Home-dakı "Tour Guide" bölməsi və Our Team səhifəsi üçün ortaq).
  Kart özü ekrana girəndə aşağıdan qalxır; delay – millisaniyə ilə gecikmə.
*/
export default function GuideCard({ guide, delay = 0 }) {
  const [ref, inView] = useInView(0.2);

  return (
    <article
      ref={ref}
      className={`guide-card${inView ? " is-inview" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <img className="guide-card__avatar" src={guide.image} alt={guide.name} loading="lazy" />

      <h3 className="guide-card__name">
        <a href="#">{guide.name}</a>
      </h3>
      <p className="guide-card__role">{guide.role}</p>

      <ul className="guide-card__socials">
        {socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noreferrer" aria-label={`${guide.name} – ${s.label}`}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                {s.icon}
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
