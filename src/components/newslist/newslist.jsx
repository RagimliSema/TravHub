import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCommentDots, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import NewsLayout from "../newssidebar/newssidebar";
import { useInView } from "../../hooks/useInView";
import { listPosts } from "../../data/posts";
import "../travhubbtn/travhubbtn.css";
import "./newslist.css";

const TEXT =
  "You’ve switched your charity’s office to renewable energy. You’ve cut most flights. The office fridge is stacked high with oat milk, and lycra-clad staff are proudly showing off their subsidised bicycles.";

/* ---------- Tarix nişanı (şəklin sol yuxarısında) ---------- */
export function DateBadge({ day = "13", month = "Dec" }) {
  return (
    <div className="date-badge">
      {day}
      <span>{month}</span>
    </div>
  );
}

/* ---------- Müəllif və şərh sayı ---------- */
export function PostMeta() {
  return (
    <ul className="post-meta">
      <li>
        <FaUser aria-hidden="true" />
        <Link to="/news-grid">Wade Warren</Link>
      </li>
      <li>
        <FaCommentDots aria-hidden="true" />
        05 Comment
      </li>
    </ul>
  );
}

/* ---------- Bir yazı: şəkil (hover-də dəyişir), meta, başlıq, mətn, düymə ---------- */
function ListItem({ post, index }) {
  const [ref, inView] = useInView(0.15);

  return (
    <article
      ref={ref}
      className={`news-item${inView ? " is-inview" : ""}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="news-item__thumb">
        <img src={post.image} alt="" aria-hidden="true" />
        <img src={post.image} alt={post.title} />
        <DateBadge />
      </div>

      <PostMeta />

      <h3 className="news-item__title">
        <Link to="/news-details">{post.title}</Link>
      </h3>
      <p className="news-item__text">{TEXT}</p>

      <Link to="/news-details" className="travhub-btn news-item__btn">
        <span>Read More</span>
      </Link>
    </article>
  );
}

/* ---------- Səhifələmə (yalnız görünüş – yazılar dəyişmir; News Grid də işlədir) ---------- */
export function Pagination() {
  const [page, setPage] = useState(2);
  const last = 4;

  return (
    <nav className="post-pagination" aria-label="Səhifələr">
      <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Əvvəlki səhifə">
        <FaArrowLeft />
      </button>
      {[1, 2, 3, 4].map((n) => (
        <button
          key={n}
          type="button"
          className={n === page ? "is-current" : ""}
          aria-current={n === page ? "page" : undefined}
          onClick={() => setPage(n)}
        >
          {n}
        </button>
      ))}
      <span className="post-pagination__dots" aria-hidden="true">...</span>
      <button type="button" onClick={() => setPage((p) => Math.min(last, p + 1))} aria-label="Növbəti səhifə">
        <FaArrowRight />
      </button>
    </nav>
  );
}

/*
  News List: 4 böyük yazı alt-alta + səhifələmə.
  sidebar yoxdursa ("/news-list") ortada 770px-lik sütun,
  sidebar="left" | "right" ("/news-list-left", "/news-list-right") – yanında sidebar.
*/
export default function NewsList({ sidebar }) {
  return (
    <section className="news-list">
      <div className={`news-list__container${sidebar ? " news-list__container--wide" : ""}`}>
        <NewsLayout sidebar={sidebar}>
          {listPosts.map((post, i) => (
            <ListItem key={post.id} post={post} index={i} />
          ))}
          <Pagination />
        </NewsLayout>
      </div>
    </section>
  );
}
