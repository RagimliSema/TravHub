import SectionTitle from "../sectiontitle/sectiontitle";
import GuideCard from "../guidecard/guidecard";
import { guides } from "../../data/guides";
import "./guidesection.css";

// Home-da ilk 4 bələdçi göstərilir (hamısı Our Team səhifəsindədir)
const homeGuides = guides.slice(0, 4);

export default function GuideSection() {
  return (
    <section className="guide-section">
      <div className="guide-container">
        <SectionTitle
          subtitle="Meet With Our Guide"
          title="Tour Guide"
          text="content of a page when looking at layout the point of using lorem the is Ipsum less"
        />

        {/* kartlar ekrana girəndə soldan sağa bir-bir görünür (hər karta +100ms) */}
        <div className="guide-grid">
          {homeGuides.map((guide, i) => (
            <GuideCard key={guide.id} guide={guide} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
