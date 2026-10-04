import { Navigate, useParams } from "react-router-dom";
import PageHeader from "../../components/pageheader/pageheader";
import TourList from "../../components/tourlist/tourlist";
import TourSidebar from "../../components/toursidebar/toursidebar";
import TourCarousel from "../../components/tourcarousel/tourcarousel";
import TourDetails from "../../components/tourdetails/tourdetails";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";
import StatusMessage from "../../components/statusmessage/statusmessage";
import { useProduct, useProducts } from "../../hooks/useProducts";

// Header-də Tours menyusunun 4 səhifəsi (demo-dakı tour*.html)

// "/tours" – Tour Page
export function Tours() {
  return (
    <>
      <PageHeader title="Our Tours" current="Tour" />
      <TourList />
      <ClientCarousel />
    </>
  );
}

// "/tours-sidebar" – Tour Sidebar
export function ToursSidebar() {
  return (
    <>
      <PageHeader title="Our Tours Sidebar" current="Tour" />
      <TourSidebar />
      <ClientCarousel />
    </>
  );
}

// "/tours-carousel" – Tour Carousel
export function ToursCarousel() {
  return (
    <>
      <PageHeader title="Tours Carousel" current="Tour" />
      <TourCarousel />
      <ClientCarousel />
    </>
  );
}

// yüklənmə və ya xəta zamanı səhifənin ortasında göstərilən blok
function DetailsStatus({ loading, error, retry }) {
  let content = <StatusMessage type="loading" text="Loading tour..." />;

  if (error?.status === 404 || error?.status === 400) {
    content = (
      <StatusMessage
        type="empty"
        title="Tour not found"
        text="This tour does not exist or has been removed."
        action={{ to: "/tours", label: "Browse Tours" }}
      />
    );
  } else if (error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!loading) {
    content = <StatusMessage type="empty" title="No tours yet" />;
  }

  return <section className="page-status">{content}</section>;
}

const DETAILS_PARENTS = [{ label: "Tour", to: "/tours" }];

// "/tour-details/:id" – backend-dən bir tur
function TourDetailsById({ id }) {
  const { tour, loading, error, retry } = useProduct(id);
  const title = tour?.title ?? "Tour Details";

  return (
    <>
      {/* key: başlıq dəyişəndə hərf animasiyası yenidən oynasın */}
      <PageHeader key={title} title={title} parents={DETAILS_PARENTS} current="Tour Details" />
      {tour ? <TourDetails tour={tour} /> : <DetailsStatus loading={loading} error={error} retry={retry} />}
      <ClientCarousel />
    </>
  );
}

// menyudakı "/tour-details" (id-siz) – ilk tura yönləndirir
function FirstTourRedirect() {
  const { tours, loading, error, retry } = useProducts({ limit: 1, sort: "newest" });

  if (tours[0]) {
    return <Navigate to={`/tour-details/${tours[0].id}`} replace />;
  }

  return (
    <>
      <PageHeader title="Tour Details" parents={DETAILS_PARENTS} current="Tour Details" />
      <DetailsStatus loading={loading} error={error} retry={retry} />
      <ClientCarousel />
    </>
  );
}

// "/tour-details" və "/tour-details/:id" – Tour Details
export function TourDetailsPage() {
  const { id } = useParams();
  return id ? <TourDetailsById id={id} /> : <FirstTourRedirect />;
}
