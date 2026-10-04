import { useState } from "react";
import TourCard from "../tourcard/tourcard";
import { ListStatus } from "../statusmessage/statusmessage";
import { useProducts } from "../../hooks/useProducts";
import "../travhubbtn/travhubbtn.css";
import "./tourlist.css";

const PAGE_SIZE = 9;
const MAX_LIMIT = 50; // backend bir sorğuda ən çox 50 məhsul qaytarır

// Tour Page ("/tours"): tur kartları (3 / 2 / 1 sütun) + "Load More Tours"
export default function TourList() {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { tours, total, loading, error, retry } = useProducts({ limit, sort: "newest" });

  // daha çox tur varsa düymə görünür, hər klikdə növbəti 9 tur əlavə olunur
  const hasMore = tours.length < total && limit < MAX_LIMIT;

  return (
    <section className="tour-list">
      <div className="tour-list__container">
        <div className="tour-list__grid">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <ListStatus loading={loading} error={error} onRetry={retry} count={tours.length} />

        {hasMore && (
          <div className="tour-list__more">
            <button
              type="button"
              className="travhub-btn"
              onClick={() => setLimit((current) => Math.min(current + PAGE_SIZE, MAX_LIMIT))}
              disabled={loading}
            >
              <span>{loading ? "Loading..." : "Load More Tours"}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
