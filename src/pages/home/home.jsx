import Hero from "../../components/hero/hero";
import Destinations from "../../components/destinations/destination";
import WhyChooseUs from "../../components/whyuse/whyus";
import TourSection from "../../components/toursection/toursection";
import GallerySection from "../../components/gallerysection/gallerysection";
import CounterSection from "../../components/countersection/countersection";
import GuideSection from "../../components/guidesection/guidesection";
import Testimonial from "../../components/testimonial/testimonial";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";
import BlogSection from "../../components/blogsection/blogsection";

// Ana səhifə ("/")
export default function Home() {
  return (
    <>
      <Hero />
      <Destinations />
      <WhyChooseUs />
      <TourSection />
      <GallerySection />
      <CounterSection />
      <GuideSection />
      <Testimonial />
      <ClientCarousel />
      <BlogSection />
    </>
  );
}
