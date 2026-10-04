import BlogCard from "../blogcard/blogcard";
import { Pagination } from "../newslist/newslist";
import NewsLayout from "../newssidebar/newssidebar";
import { useInView } from "../../hooks/useInView";
import { posts } from "../../data/posts";
import "./newsgrid.css";

// hər kart özü ekrana girəndə aşağıdan qalxır (sırada soldan sağa 0 / 0.1 / 0.2s)
function RevealCard({ post, index }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div ref={ref} className={`blog-reveal${inView ? " is-inview" : ""}`}>
      <BlogCard post={post} index={index} />
    </div>
  );
}

/*
  News Grid: 6 yazı + səhifələmə.
  sidebar yoxdursa ("/news-grid") 3 / 2 / 1 sütun,
  sidebar="left" | "right" ("/news-grid-left", "/news-grid-right") – yanında sidebar, kartlar 2 sütun.
*/
export default function NewsGrid({ sidebar }) {
  const perRow = sidebar ? 2 : 3;

  return (
    <section className="news-grid">
      <div className="news-grid__container">
        <NewsLayout sidebar={sidebar}>
          <div className={`news-grid__grid${sidebar ? " news-grid__grid--half" : ""}`}>
            {posts.map((post, i) => (
              <RevealCard key={post.id} post={post} index={i % perRow} />
            ))}
          </div>
          <Pagination />
        </NewsLayout>
      </div>
    </section>
  );
}
