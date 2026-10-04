import PageHeader from "../../components/pageheader/pageheader";
import DestinationList from "../../components/destinationlist/destinationlist";
import DestinationCarousel from "../../components/destinationcarousel/destinationcarousel";
import DestinationDetails from "../../components/destinationdetails/destinationdetails";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// Header-də Destination menyusunun 3 səhifəsi (demo-dakı destination*.html)

// "/destination"
export function Destination() {
  return (
    <>
      <PageHeader title="Destinations" current="Destination" />
      <DestinationList />
      <ClientCarousel />
    </>
  );
}

// "/destination-carousel"
export function DestinationCarouselPage() {
  return (
    <>
      <PageHeader title="Destinations Carousel" current="Destination" />
      <DestinationCarousel />
      <ClientCarousel />
    </>
  );
}

// "/destination-details"
export function DestinationDetailsPage() {
  return (
    <>
      <PageHeader
        title="Destination Details"
        parents={[{ label: "Destination", to: "/destination" }]}
        current="Destination Details"
      />
      <DestinationDetails />
      <ClientCarousel />
    </>
  );
}
