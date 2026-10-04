import { useEffect, useRef } from "react";
import SectionTitle from "../sectiontitle/sectiontitle";
import SnapDots from "../snapdots/snapdots";
import DestinationCard from "../destinationcard/destinationcard";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { destinations } from "../../data/destinations";
import "./destination.css";

// ana səhifədə ilk 4 destinasiya (bütün siyahı: src/data/destinations.js)
const homeDestinations = destinations.slice(0, 4);

export default function TopDestinations() {
  const sectionRef = useRef(null);
  // kiçik ekranlarda kartlar yana sürüşür (altda nöqtələr)
  const { ref: sliderRef, pages, active, goTo } = useSnapScroll(homeDestinations.length);

  // kartlar ekrana girəndə aşağıdan qalxır
  useEffect(() => {
    const items = sectionRef.current.querySelectorAll(".td-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="top-destinations" ref={sectionRef}>
      <div className="td-container">
        <SectionTitle
          subtitle="Destinations"
          title="Top Destinations"
          text="content of a page when looking at layout the point of using lorem the is Ipsum less"
        />

        <div ref={sliderRef} className="td-grid snap-row">
          {homeDestinations.map((item, index) => (
            <DestinationCard
              key={item.id}
              destination={item}
              className="td-reveal"
              style={{ transitionDelay: `${0.1 * index}s` }}
            />
          ))}
        </div>

        <SnapDots pages={pages} active={active} onSelect={goTo} label="Destinasiyalar" />
      </div>
    </section>
  );
}
