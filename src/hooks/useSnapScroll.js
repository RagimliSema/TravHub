import { useEffect, useRef, useState } from "react";



const getPerView = (el) =>
  parseInt(getComputedStyle(el).getPropertyValue("--per-view"), 10) || 1;

// səhifənin başladığı kartın mövqeyi (px)
const getPageLeft = (el, page, perView, itemCount) => {
  const items = el.children;
  const index = Math.max(0, Math.min(page * perView, itemCount - perView));
  return items[index].offsetLeft - items[0].offsetLeft;
};

export function useSnapScroll(itemCount) {
  const ref = useRef(null);
  const [pages, setPages] = useState(1);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;

    // kartlar hələ backend-dən gəlməyibsə gözlə (itemCount dəyişəndə yenidən işləyir)
    if (!el || itemCount === 0) return;

    // bir neçə kart üçün ucuz hesablamadır – hər scroll/resize-da birbaşa işləyir
    const update = () => {
      const perView = getPerView(el);
      const count = Math.max(1, Math.ceil(itemCount / perView));

      let best = 0;
      let bestDistance = Infinity;
      for (let page = 0; page < count; page++) {
        const distance = Math.abs(el.scrollLeft - getPageLeft(el, page, perView, itemCount));
        if (distance < bestDistance) {
          bestDistance = distance;
          best = page;
        }
      }

      setPages(count);
      setActive(best);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [itemCount]);

  const goTo = (page) => {
    const el = ref.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      left: getPageLeft(el, page, getPerView(el), itemCount),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return { ref, pages, active, goTo };
}
