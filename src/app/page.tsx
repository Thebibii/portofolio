"use client";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import FeaturedSection from "@/components/reusable/home/featured-section";
import Footer from "@/components/reusable/home/footer";
import Navbar from "@/components/reusable/navbar";
import { useGetDataHome } from "@/hooks/react-query/guest/use-query";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { toast } from "sonner";

export default function Home() {
  const { data, isLoading, isError, error } = useGetDataHome();

  if (isError && error) {
    toast.error("Gagal memuat data", {
      description: error.message,
      id: "home-error", // Prevent duplicate toasts
    });
  }

  return (
    <Fragment>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "inset-x-0 inset-y-[-30%] opacity-40  -z-50 h-full skew-y-12"
        )}
      />
      <Navbar />
      <main className="">
        <FeaturedSection
          data={data?.data}
          isLoadingError={!isLoading && !isError}
        />
      </main>
      <Footer />
    </Fragment>
  );
}
