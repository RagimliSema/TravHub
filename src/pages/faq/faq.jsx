import PageHeader from "../../components/pageheader/pageheader";
import FaqSection from "../../components/faqsection/faqsection";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// FAQ səhifəsi ("/faq") – header-də Pages → FAQs
export default function Faq() {
  return (
    <>
      <PageHeader title="Frequently Asked Question" current="Faq" />
      <FaqSection />
      <ClientCarousel />
    </>
  );
}
