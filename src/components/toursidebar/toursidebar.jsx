import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaLocationDot,
  FaCalendarDays,
  FaPersonWalkingLuggage,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { MdLuggage } from "react-icons/md";
import TourCard from "../tourcard/tourcard";
import StatusMessage, { ListStatus } from "../statusmessage/statusmessage";
import { SidebarBox } from "../sidebarwidgets/sidebarwidgets";
import { useInView } from "../../hooks/useInView";
import { useProducts } from "../../hooks/useProducts";
import { productApi } from "../../services/api";
import "../travhubbtn/travhubbtn.css";
import "./toursidebar.css";

const PAGE_SIZE = 8; // demo-dakı kimi sağda 8 kart
const MAX_LIMIT = 50;

// sıralama backend-də edilir (/api/products?sort=...)
const SORTS = [
  { value: "newest", label: "Sort by publish date" },
  { value: "popular", label: "Sort by popularity" },
  { value: "price_asc", label: "Sort by price: low to high" },
  { value: "price_desc", label: "Sort by price: high to low" },
];

/* ---------- Sol tərəf: axtarış forması + "Last Minute" ----------
   Location → ad və məkanda axtarış, Type → kateqoriya (backend-dən).
   Tarix və qonaq sayı hələlik yalnız formada qalır (backend-də tarix sistemi yoxdur). */
function TourSearchForm({ initialSearch, initialCategory, onSearch }) {
  const [dateType, setDateType] = useState("text");
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    productApi
      .categories()
      .then((data) => !cancelled && setCategories(data.categories))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Enter və ya "Search" düyməsi; boş axtarış bütün turları göstərir
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: search.trim().replace(/\s+/g, " "), category });
  };

  return (
    <form className="tour-search" onSubmit={handleSubmit}>
      <div className="tour-search__control">
        <FaLocationDot className="tour-search__icon" aria-hidden="true" />
        <label htmlFor="ts-location">Location</label>
        <input
          id="ts-location"
          type="text"
          placeholder="Where to next"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="tour-search__control">
        <MdLuggage className="tour-search__icon" aria-hidden="true" />
        <label htmlFor="ts-type">Type</label>
        <select id="ts-type" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Booking Type</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="tour-search__control">
        <FaCalendarDays className="tour-search__icon" aria-hidden="true" />
        <label htmlFor="ts-date">Date From</label>
        {/* boşdursa "Select Date" yazılır, klikləyəndə təqvim açılır */}
        <input
          id="ts-date"
          type={dateType}
          placeholder="Select Date"
          onFocus={() => setDateType("date")}
          onBlur={(e) => !e.target.value && setDateType("text")}
        />
      </div>

      <div className="tour-search__control">
        <FaPersonWalkingLuggage className="tour-search__icon" aria-hidden="true" />
        <label htmlFor="ts-guests">Guests</label>
        <input id="ts-guests" type="number" min={1} max={20} defaultValue="02" />
      </div>

      <div className="tour-search__control">
        <button type="submit" className="travhub-btn tour-search__submit">
          <span>
            Search <FaMagnifyingGlass aria-hidden="true" />
          </span>
        </button>
      </div>
    </form>
  );
}

// "Last Minute": ən yeni 3 tur
function LastMinute() {
  const { tours, loading, error, retry } = useProducts({ limit: 3, sort: "newest" });

  if (!tours.length) {
    return error ? (
      <StatusMessage type="error" text={error.message} onRetry={retry} compact />
    ) : (
      loading && <StatusMessage type="loading" compact />
    );
  }

  return (
    <ul className="last-minute">
      {tours.map((tour) => (
        <li key={tour.id} className="last-minute__item">
          <img className="last-minute__image" src={tour.image} alt="" />
          <div>
            <p className="last-minute__price">${tour.price}</p>
            <h3 className="last-minute__title">
              <Link to={`/tour-details/${tour.id}`}>{tour.title}</Link>
            </h3>
            <p className="last-minute__location">
              <FaLocationDot aria-hidden="true" />
              {tour.location}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Bölmə ---------- */
export default function TourSidebar() {
  // axtarış URL-də saxlanılır: /tours-sidebar?search=rome&category=Beach
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { tours, total, loading, error, retry } = useProducts({ search, category, sort, limit });
  const hasMore = tours.length < total && limit < MAX_LIMIT;
  const isFiltered = !!(search || category);

  const [asideRef, asideInView] = useInView(0.1);
  const [listRef, listInView] = useInView(0.1);

  const handleSearch = (values) => {
    setLimit(PAGE_SIZE);
    setSearchParams(Object.fromEntries(Object.entries(values).filter(([, value]) => value)));
  };

  const handleSort = (value) => {
    setLimit(PAGE_SIZE);
    setSort(value);
  };

  return (
    <section className="tour-sidebar">
      <div className="tour-sidebar__container">
        <div className="tour-sidebar__row">
          <aside ref={asideRef} className={`tour-sidebar__aside${asideInView ? " is-inview" : ""}`}>
            <SidebarBox>
              {/* key: URL dəyişəndə (məs. hero-dan axtarış) forma yeni dəyərlərlə yenilənir */}
              <TourSearchForm
                key={searchParams.toString()}
                initialSearch={search}
                initialCategory={category}
                onSearch={handleSearch}
              />
            </SidebarBox>

            <SidebarBox title="Last Minute">
              <LastMinute />
            </SidebarBox>
          </aside>

          <div ref={listRef} className={`tour-sidebar__main${listInView ? " is-inview" : ""}`}>
            <div className="tour-sidebar__top">
              <h2 className="tour-sidebar__count">{loading && !tours.length ? "Loading" : total} Properties</h2>

              <label className="tour-sidebar__sort">
                <select aria-label="Sıralama" value={sort} onChange={(e) => handleSort(e.target.value)}>
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="tour-sidebar__grid">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            <ListStatus
              loading={loading}
              error={error}
              onRetry={retry}
              count={tours.length}
              emptyTitle={search ? `No tours found for "${search}".` : "No tours found"}
              emptyText={isFiltered ? "Try another location or booking type." : undefined}
              emptyAction={isFiltered ? { to: "/tours-sidebar", label: "Clear Filters" } : undefined}
            />

            {hasMore && (
              <div className="tour-sidebar__more">
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
        </div>
      </div>
    </section>
  );
}
