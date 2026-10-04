import PageHeader from "../../components/pageheader/pageheader";
import PricingPlans from "../../components/pricingplans/pricingplans";
import PricingInfo from "../../components/pricinginfo/pricinginfo";
import Testimonial from "../../components/testimonial/testimonial";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// Pricing səhifəsi ("/pricing") – header-də Pages → Pricing Table
export default function Pricing() {
  return (
    <>
      <PageHeader title="Our Pricing Plan" current="Pricing" />
      <PricingPlans />
      <PricingInfo />
      <Testimonial />
      <ClientCarousel />
    </>
  );
}
