import { useEffect, useRef, useState } from "react";

// Element ekrana girəndə true qaytarır (yalnız bir dəfə)
export function useInView(threshold = 0.3) {
  const ref = useRef(null);
  // IntersectionObserver olmayan köhnə brauzerdə məzmun dərhal görünsün
  const [inView, setInView] = useState(() => !("IntersectionObserver" in window));

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, inView]);

  return [ref, inView];
}
