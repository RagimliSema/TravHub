import SnapDots from "../snapdots/snapdots";
import TourCard from "../tourcard/tourcard";
import { ListStatus } from "../statusmessage/statusmessage";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { useProducts } from "../../hooks/useProducts";
import "./tourcarousel.css";

/*
  Tour Carousel ("/tours-carousel"): bütün turlar bir sırada, 3 / 2 / 1 görünür.
  Yana sürüşdürmək (toxunma, trackpad) və ya altdakı nöqtələrlə keçmək olur.
*/
export default function TourCarousel() {
  const { tours, loading, error, retry } = useProducts({ limit: 50, sort: "newest" });
  const { ref: sliderRef, pages, active, goTo } = useSnapScroll(tours.length);

  return (
    <section className="tour-carousel">
      <div className="tour-carousel__container">
        <div ref={sliderRef} className="tour-carousel__row snap-row">
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
