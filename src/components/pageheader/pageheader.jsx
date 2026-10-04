import { Link } from "react-router-dom";
import "./pageheader.css";

import plane from "../../assets/image/plane.png";
import balloon from "../../assets/image/cloude-1-2.png";
import skyline from "../../assets/image/page-header-bg-shape.png";

/*
  Daxili səhifələrin başlığı (About, Contact ... üçün təkrar işlənir):
  böyük başlıq + "Home / Səhifə" yolu, solda təyyarə, sağda hava şarı,
  aşağıda dayanmadan sola axan şəhər siluetləri (demo-dakı kimi).

  İstifadə:  <PageHeader title="About Us" current="About" />
  Aradakı səhifələr üçün (Home / Tour / Tour Details):
             <PageHeader title="..." parents={[{ label: "Tour", to: "/tours" }]} current="Tour Details" />
*/
export default function PageHeader({ title, current, parents = [] }) {
  return (
    <section className="page-header">
      <div
        className="page-header__bg"
        style={{ backgroundImage: `url(${skyline})` }}
        aria-hidden="true"
      />
      <img className="page-header__shape page-header__shape--plane" src={plane} alt="" aria-hidden="true" />
      <img className="page-header__shape page-header__shape--balloon" src={balloon} alt="" aria-hidden="true" />

      <div className="page-header__container">
        <h1 className="page-header__title">
          {/* hərflər sağdan gəlir (demo-dakı bw-split-in-right) */}
          <span className="page-header__sr">{title}</span>
          <span aria-hidden="true">
            {[...title].map((char, i) => (
              <span key={i} className="page-header__char" style={{ "--i": i }}>
                {char === " " ? " " : char}
              </span>
            ))}
          </span>
        </h1>

        <nav aria-label="Breadcrumb">
          <ol className="page-header__breadcrumb">
            <li>
              <Link to="/">Home</Link>
            </li>
            {parents.map((parent) => (
              <li key={parent.to}>
                <Link to={parent.to}>{parent.label}</Link>
              </li>
            ))}
            <li aria-current="page">{current}</li>
          </ol>
        </nav>
      </div>
    </section>
  );
}
