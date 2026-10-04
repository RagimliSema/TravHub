import PageHeader from "../../components/pageheader/pageheader";
import TeamSection from "../../components/teamsection/teamsection";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

// Our Team səhifəsi ("/team") – header-də Pages → Our Team
export default function Team() {
  return (
    <>
      <PageHeader title="Our Guide" current="Guide" />
      <TeamSection />
      <ClientCarousel />
    </>
  );
}
