import { useEffect, useState } from "react";

/*
  Demo-dakı sticky header məntiqi: səhifə `offset`-dən (500px) aşağıdadırsa,
  yuxarı scroll edəndə true, aşağı scroll edəndə false qaytarır.
  Yuxarıya (offset-ə qədər) qayıdanda həmişə false olur.
*/
export function useScrollUpSticky(offset = 500) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      if (y <= offset) setVisible(false);
      else if (y < lastY) setVisible(true);
      else if (y > lastY) setVisible(false);

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  return visible;
}
