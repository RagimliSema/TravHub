import "./snapdots.css";

/* Yana sürüşən sıranın altındakı nöqtələr (hamısı ekrana sığanda görünmür).
   Məntiq src/hooks/useSnapScroll.js-dədir. */
export default function SnapDots({ pages, active, onSelect, label }) {
  if (pages <= 1) return null;

  return (
    <div className="snap-dots" role="group" aria-label={label}>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`snap-dot${i === active ? " is-active" : ""}`}
          aria-label={`Səhifə ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
