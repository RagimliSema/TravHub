import PageHeader from "../../components/pageheader/pageheader";
import NotFoundSection from "../../components/notfoundsection/notfoundsection";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// 404 səhifəsi ("/404" və mövcud olmayan bütün ünvanlar) – header-də Pages → 404 Error
export default function NotFound() {
  return (
    <>
      <PageHeader title="Page Not Found" current="404" />
      <NotFoundSection />
      <ClientCarousel />
    </>
  );
}
