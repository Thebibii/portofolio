"use client";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import FeaturedSection from "@/components/reusable/home/featured-section";
import Footer from "@/components/reusable/home/footer";
import Navbar from "@/components/reusable/navbar";

import { useAdminProjects } from "@/hooks/react-query/admin/projects/use-query";
import { useGetDataHome } from "@/hooks/react-query/guest/use-query";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

export default function Home() {
  const { data } = useGetDataHome();
  console.log(data?.data);

  return (
    <Fragment>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn("inset-x-0 inset-y-[-30%] -z-50 h-full skew-y-12")}
      />
      <Navbar />
      <main className="">
        <FeaturedSection data={data?.data} />
      </main>
      <Footer />
    </Fragment>
  );
}
