import { useEffect, useState } from "react";
import BlogCard from "../blogcard/blogcard";
import SnapDots from "../snapdots/snapdots";
import { useInView } from "../../hooks/useInView";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { posts } from "../../data/posts";
import "./newscarousel.css";

const AUTOPLAY_MS = 5000;

/*
  News Carousel ("/news-carousel"): 6 yazı bir sırada, 3 / 2 / 1 görünür.
  Demo-dakı kimi özü-özünə sürüşür (5 saniyədən bir), sonda əvvələ qayıdır.
  Siçan üstündə olanda dayanır. Nöqtələrlə və yana sürüşdürməklə də keçmək olur.
*/
export default function NewsCarousel() {
  const { ref: sliderRef, pages, active, goTo } = useSnapScroll(posts.length);
  const [revealRef, inView] = useInView(0.15);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || pages <= 1 || reduceMotion) return;

    const timer = setTimeout(() => goTo((active + 1) % pages), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, pages, paused, goTo]);

  return (
    <section className="news-carousel">
      <div
        ref={revealRef}
        className={`news-carousel__container blog-reveal${inView ? " is-inview" : ""}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div ref={sliderRef} className="news-carousel__row snap-row">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i % 3} />
          ))}
        </div>

        <SnapDots pages={pages} active={active} onSelect={goTo} label="Bloq yazıları" />
      </div>
    </section>
  );
}
