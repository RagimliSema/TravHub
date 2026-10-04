import PageHeader from "../../components/pageheader/pageheader";
import ContactSection from "../../components/contactsection/contactsection";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// Contact səhifəsi ("/contact")
export default function Contact() {
  return (
    <>
      <PageHeader title="Contact Us" current="Contact" />
      <ContactSection />
      <ClientCarousel />
    </>
  );
}
