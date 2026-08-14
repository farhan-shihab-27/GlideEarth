import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import LatestArrivals from "@/components/LatestArrivals";
import NewsletterBanner from "@/components/NewsletterBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <LatestArrivals />
      <NewsletterBanner />
    </>
  );
}
