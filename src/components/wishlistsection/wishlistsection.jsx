import { useEffect, useState } from "react";
import TourCard from "../tourcard/tourcard";
import { ListStatus } from "../statusmessage/statusmessage";
import { useAuth } from "../../context/AuthContext";
import { wishlistApi } from "../../services/api";
import { toTour } from "../../utils/products";
import "../tourlist/tourlist.css";

/*
  Wishlist ("/wishlist"): bəyənilən turlar (GET /api/wishlist).
  Tours səhifəsi ilə eyni kart cədvəli. Kartdakı ürəyi söndürəndə tur dərhal siyahıdan çıxır.
*/
export default function WishlistSection() {
  const { user } = useAuth();
  const savedIds = user?.savedProducts ?? [];
  const savedKey = savedIds.join(",");

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: null, tours: [], error: null });
  const requestKey = `${savedKey}#${attempt}`;

  // bəyənilənlər dəyişəndə (məs. başqa səhifədə like) siyahı yenidən yüklənir
  useEffect(() => {
    const controller = new AbortController();
    wishlistApi
      .list(controller.signal)
      .then((data) => setState({ key: requestKey, tours: data.products.map(toTour), error: null }))
      .catch((error) => error.name !== "AbortError" && setState((prev) => ({ ...prev, key: requestKey, error })));
    return () => controller.abort();
  }, [requestKey]);

  // unlike edilən kart cavabı gözləmədən yox olsun
  const tours = state.tours.filter((tour) => savedIds.includes(tour.id));

  return (
    <section className="tour-list">
      <div className="tour-list__container">
        <div className="tour-list__grid">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <ListStatus
          loading={state.key !== requestKey}
          error={state.key === requestKey ? state.error : null}
          onRetry={() => setAttempt((n) => n + 1)}
          count={tours.length}
          loadingText="Loading your wishlist..."
          emptyTitle="Your wishlist is empty"
          emptyText="Tap the heart on any tour to save it here."
          emptyAction={{ to: "/tours", label: "Browse Tours" }}
        />
      </div>
    </section>
  );
}
