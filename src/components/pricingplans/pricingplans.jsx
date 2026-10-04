import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import "./pricingplans.css";

const plans = [
  {
    name: "Starter",
    price: "Free",
    text: "Simplify and consolidate business travel booking",
    listTitle: "Business travel basic",
    features: [
      "Book all your business travel",
      "Book from an extensive travel",
      "Consolidated invoicing",
      "Unlimited cost centers",
      "Simple travel reporting",
    ],
  },
  {
    name: "Premium",
    price: "$199",
    text: "Spend less time booking travel, whilst controlling spend",
    listTitle: "Everything in Starter, and",
    features: [
      "10 policy approval workflows",
      "Track budgets for up 5 cost",
      "Save up to 25% with VAT",
      "Secure traveler sign in",
      "Custom fields",
    ],
  },
  {
    name: "Pro",
    price: "$299",
    text: "Use advanced tools to optimize your travel budgets, spend",
    listTitle: "Business travel basic",
    features: [
      "Unlimited policy and approval",
      "Unlimited budgets by center",
      "Custom reports & insights",
      "Corporate rates",
      "Create custom integration",
    ],
  },
  {
    name: "Enterprise",
    price: "Free",
    text: "Large budget? Bespoke requirements? Talk to us",
    listTitle: "Business travel basic",
    features: [
      "Book all your business travel",
      "Book from an extensive travel",
      "Consolidated invoicing",
      "Unlimited cost centers",
      "Simple travel reporting",
    ],
  },
];

/*
  Plan kartı. Hover-də (demo-dakı kimi, JS yoxdur – yalnız CSS):
  yaşıl təbəqə yuxarıdan aşağı dolur, mətnlər ağarır, düymə ağ olur.
*/
function PlanCard({ plan, delay }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`pricing-col${inView ? " is-inview" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <article className="pricing-card">
        <p className="pricing-card__name">{plan.name}</p>
        <h3 className="pricing-card__price">{plan.price}</h3>
        <p className="pricing-card__text">{plan.text}</p>

        {/* demo-da da "Choose Plan" əlaqə səhifəsinə aparır */}
        <Link to="/contact" className="pricing-card__btn">
          <span>Choose Plan</span>
        </Link>

        <p className="pricing-card__list-title">{plan.listTitle}</p>
        <ul className="pricing-card__list">
          {plan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export default function PricingPlans() {
  return (
    <section className="pricing-plans">
      <div className="pricing-container">
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
