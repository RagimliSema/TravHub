import SnapDots from "../snapdots/snapdots";
import DestinationCard from "../destinationcard/destinationcard";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { destinations } from "../../data/destinations";
import "./destinationcarousel.css";

/*
  Destination Carousel ("/destination-carousel"): 12 kart bir sırada, 4 / 3 / 2 / 1 görünür.
  Yana sürüşdürmək (toxunma, trackpad) və ya altdakı nöqtələrlə keçmək olur.
*/
export default function DestinationCarousel() {
  const { ref: sliderRef, pages, active, goTo } = useSnapScroll(destinations.length);

  return (
    <section className="destination-carousel">
      <div className="destination-carousel__container">
        <div ref={sliderRef} className="destination-carousel__row snap-row">
          {destinations.map((item) => (
            <DestinationCard key={item.id} destination={item} />
          ))}
        </div>

        <SnapDots pages={pages} active={active} onSelect={goTo} label="Destinasiyalar" />
      </div>
    </section>
  );
}
