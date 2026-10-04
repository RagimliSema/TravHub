import PageHeader from "../../components/pageheader/pageheader";
import GallerySection from "../../components/gallerysection/gallerysection";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// Gallery səhifəsi ("/gallery") – header-də Pages → Gallery
export default function Gallery() {
  return (
    <>
      <PageHeader title="Our Memories" current="Gallery" />
      <GallerySection page />
      <ClientCarousel />
    </>
  );
}
