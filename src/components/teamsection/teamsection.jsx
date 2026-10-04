import { Link } from "react-router-dom";
import GuideCard from "../guidecard/guidecard";
import { guides } from "../../data/guides";
import "./teamsection.css";

/*
  Our Team səhifəsinin kartları: 12 bələdçi, 4 sütun.
  Hər sırada kartlar soldan sağa 0.1 / 0.2 / 0.3 / 0.4 saniyə gecikmə ilə gəlir
  (demo-dakı kimi, hər kart özü ekrana girəndə).
*/
export default function TeamSection() {
  return (
    <section className="team-section">
      <div className="team-container">
        <div className="team-grid">
          {guides.map((guide, i) => (
            <GuideCard key={guide.id} guide={guide} delay={100 + (i % 4) * 100} />
          ))}
        </div>

        {/* demo-da da bu düymə eyni səhifəyə aparır */}
        <div className="team-section__more">
          <Link to="/team" className="team-section__btn">
            <span>Load More Guide</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
