import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import "../travhubbtn/travhubbtn.css";
import "./notfoundsection.css";

import errorImage from "../../assets/image/404.png";

/*
  404 bölməsi (demo-dakı 404.html):
  solda sağa-sola yırğalanan "404" şəkli (aşağıdan qalxır),
  sağda başlıq, mətn və ana səhifəyə qaytaran düymə (sağdan gəlir).
*/
export default function NotFoundSection() {
  const [imageRef, imageInView] = useInView(0.2);
  const [contentRef, contentInView] = useInView(0.2);

  return (
    <section className="not-found">
      <div className="not-found__container">
        <div className="not-found__row">
          <div ref={imageRef} className={`not-found__image${imageInView ? " is-inview" : ""}`}>
            <img src={errorImage} alt="404 – səhifə tapılmadı" />
          </div>

          <div ref={contentRef} className={`not-found__content${contentInView ? " is-inview" : ""}`}>
            <h2 className="not-found__title">404</h2>
            <h3 className="not-found__subtitle">Oops! Page Not Found</h3>
            <p className="not-found__text">
              Unfortunately, something went wrong and this <br />
              page does not exist. Try using the search or <br />
              return to the previous page.
            </p>
            <Link to="/" className="travhub-btn">
              <span>Go To Home Page</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
