import PageHeader from "../../components/pageheader/pageheader";
import WhyChooseUs from "../../components/whyuse/whyus";
import GallerySection from "../../components/gallerysection/gallerysection";
import CounterSection from "../../components/countersection/countersection";
import GuideSection from "../../components/guidesection/guidesection";
import Testimonial from "../../components/testimonial/testimonial";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";
import BlogSection from "../../components/blogsection/blogsection";

// About səhifəsi ("/about") – demo-dakı sıra ilə; bölmələr Home ilə ortaqdır
export default function About() {
  return (
    <>
      <PageHeader title="About Us" current="About" />
      <WhyChooseUs />
      <GallerySection />
      <CounterSection />
      <GuideSection />
      <Testimonial />
      <ClientCarousel />
      <BlogSection />
    </>
  );
}
