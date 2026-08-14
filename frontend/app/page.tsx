import { Suspense } from "react";
import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedCategoriesSkeleton from "@/components/FeaturedCategoriesSkeleton";
import LatestArrivals from "@/components/LatestArrivals";
import LatestArrivalsSkeleton from "@/components/LatestArrivalsSkeleton";
import NewsletterBanner from "@/components/NewsletterBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<FeaturedCategoriesSkeleton />}>
        <FeaturedCategories />
      </Suspense>
      <Suspense fallback={<LatestArrivalsSkeleton />}>
        <LatestArrivals />
      </Suspense>
      <NewsletterBanner />
    </>
  );
}
