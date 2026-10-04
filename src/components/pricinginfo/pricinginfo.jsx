import { FaSuitcase, FaUserGroup, FaCalendarCheck, FaHeadset } from "react-icons/fa6";
import SectionTitle from "../sectiontitle/sectiontitle";
import { useInView } from "../../hooks/useInView";
import "./pricinginfo.css";

const features = [
  { title: "Unbeatable trip options", Icon: FaSuitcase },
  { title: "Unlimited users", Icon: FaUserGroup },
  { title: "Only pay when you book", Icon: FaCalendarCheck },
  { title: "24/7 support", Icon: FaHeadset },
];

const TEXT = "Content of a page when looking at layout the point of using lorem the is Ipsum less normal";

/* Kart: hover-də çərçivə yaşıllaşır, ikon qısa titrəyir (demo-dakı messageMove) */
function FeatureCard({ feature, delay }) {
  const [ref, inView] = useInView(0.2);
  const { Icon } = feature;

  return (
    <div
      ref={ref}
      className={`pricing-info__col${inView ? " is-inview" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <article className="pricing-info__item">
        <span className="pricing-info__icon" aria-hidden="true">
          <Icon />
        </span>
        <h3 className="pricing-info__title">{feature.title}</h3>
        <p className="pricing-info__text">{TEXT}</p>
      </article>
    </div>
  );
}

export default function PricingInfo() {
  return (
    <section className="pricing-info">
      <div className="pricing-info__container">
        <SectionTitle
          title="Included In All Plans"
          text="content of a page when looking at layout the point of using lorem the is Ipsum less"
        />

        <div className="pricing-info__grid">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} delay={100 + i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
