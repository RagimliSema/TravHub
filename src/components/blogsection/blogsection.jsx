import { useEffect, useRef } from "react";
import SectionTitle from "../sectiontitle/sectiontitle";
import BlogCard from "../blogcard/blogcard";
import { useInView } from "../../hooks/useInView";
import SnapDots from "../snapdots/snapdots";
import { useSnapScroll } from "../../hooks/useSnapScroll";
import { posts as allPosts } from "../../data/posts";
import "./blogsection.css";

import blogShape from "../../assets/image/blog-1-shape.png";

// ana səhifədə ilk 3 yazı (bütün siyahı: src/data/posts.js)
const posts = allPosts.slice(0, 3);

export default function BlogSection() {
  const sectionRef = useRef(null);
  const shapeRef = useRef(null);
  const [gridRef, gridInView] = useInView(0.15);
  // kiçik ekranlarda kartlar yana sürüşür (altda nöqtələr)
  const { ref: sliderRef, pages, active, goTo } = useSnapScroll(posts.length);

  /* Arxadakı bəzək scroll-da səhifədən bir az tez yuxarı qalxır (parallax) */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = null;

    const update = () => {
      const rect = sectionRef.current.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      shapeRef.current.style.transform = `translate3d(0, ${offset * 0.2}px, 0)`;
      frame = null;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="blog-section">
      {/* hava şarı, bulud və qırıq xətlər – yuxarı-aşağı üzür */}
      <div ref={shapeRef} className="blog-section__shape" aria-hidden="true">
        <img src={blogShape} alt="" />
      </div>

      <div className="blog-container">
        <SectionTitle
          subtitle="Blog Post"
          title="Our Latest Blog Post"
          text="content of a page when looking at layout the point of using lorem the is Ipsum less"
        />

        <div ref={gridRef} className={`blog-reveal${gridInView ? " is-inview" : ""}`}>
          <div ref={sliderRef} className="blog-grid snap-row">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>

          <SnapDots pages={pages} active={active} onSelect={goTo} label="Bloq yazıları" />
        </div>
      </div>
    </section>
  );
}
