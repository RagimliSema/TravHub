import PageHeader from "../../components/pageheader/pageheader";
import NewsGrid from "../../components/newsgrid/newsgrid";
import NewsList from "../../components/newslist/newslist";
import NewsCarousel from "../../components/newscarousel/newscarousel";
import NewsDetails from "../../components/newsdetails/newsdetails";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

/*
  Header-də News menyusunun səhifələri (demo-dakı blog-*.html).
  Grid, List və Details-in hər birinin 3 variantı var:
  sidebar yoxdur / sidebar solda ("left") / sidebar sağda ("right").
*/

// "/news-grid", "/news-grid-left", "/news-grid-right"
export function NewsGridPage({ sidebar }) {
  return (
    <>
      <PageHeader title="Blog Grid" current="Blog" />
      <NewsGrid sidebar={sidebar} />
      <ClientCarousel />
    </>
  );
}

// "/news-list", "/news-list-left", "/news-list-right"
export function NewsListPage({ sidebar }) {
  return (
    <>
      <PageHeader title="Blog List" current="Blog" />
      <NewsList sidebar={sidebar} />
      <ClientCarousel />
    </>
  );
}

// "/news-carousel"
export function NewsCarouselPage() {
  return (
    <>
      <PageHeader title="Blog Carousel" current="Blog" />
      <NewsCarousel />
      <ClientCarousel />
    </>
  );
}

// "/news-details", "/news-details-left", "/news-details-right"
export function NewsDetailsPage({ sidebar }) {
  return (
    <>
      <PageHeader title="Blog Details" parents={[{ label: "Blog", to: "/news-grid" }]} current="Blog Details" />
      <NewsDetails sidebar={sidebar} />
      <ClientCarousel />
    </>
  );
}
