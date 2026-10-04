import { Link } from "react-router-dom";
import { FaCalendarDays, FaCommentDots } from "react-icons/fa6";
import "./blogcard.css";

/*
  Bloq kartı (ana səhifə, News Grid, News Carousel).
  Hover (demo-dakı kimi): şəklin iki nüsxəsi var – görünən nüsxə sola uzanıb
  bulanıqlaşaraq itir, gizli nüsxə sağdan gəlib yerinə oturur.
  Giriş animasiyası üçün kartı ".blog-reveal" qutusuna qoyun (index → gecikmə).
*/
export default function BlogCard({ post, index = 0 }) {
  return (
    <article className="blog-card" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="blog-card__thumb">
        <img src={post.image} alt="" aria-hidden="true" />
        <img src={post.image} alt={post.title} />
      </div>

      <div className="blog-card__content">
        <h3 className="blog-card__title">
          <Link to="/news-details">{post.title}</Link>
        </h3>

        <ul className="blog-card__meta">
          <li>
            <FaCalendarDays aria-hidden="true" />
            {post.date}
          </li>
          <li>
            <FaCommentDots aria-hidden="true" />
            {post.comments} Comments
          </li>
        </ul>
      </div>
    </article>
  );
}
