import SectionTitle from "../sectiontitle/sectiontitle";
import SnapDots from "../snapdots/snapdots";
import TourCard from "../tourcard/tourcard";
import { ListStatus } from "../statusmessage/statusmessage";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { useProducts } from "../../hooks/useProducts";
import "./toursection.css";

/* ---------- Bölmə ---------- */
// ana səhifədə ən çox bəyənilən 3 tur (backend: /api/products?sort=popular&limit=3)
export default function TourSection() {
  const { tours, loading, error, retry } = useProducts({ limit: 3, sort: "popular" });

  // kiçik ekranlarda kartlar yana sürüşür (altda nöqtələr)
  const { ref: sliderRef, pages, active, goTo } = useSnapScroll(tours.length);

  return (
    <section className="tour-section">
      <div className="tour-container">
        <SectionTitle
          subtitle="Featured Tours"
          title="Most Favorite Tour Place"
          text="content of a page when looking at layout the point of using lorem the is Ipsum less"
        />

        <div ref={sliderRef} className="tour-grid snap-row">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <ListStatus loading={loading} error={error} onRetry={retry} count={tours.length} />

        <SnapDots pages={pages} active={active} onSelect={goTo} label="Turlar" />
      </div>
    </section>
  );
}
