"use client";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import FeaturedSection from "@/components/reusable/home/featured-section";
import Footer from "@/components/reusable/home/footer";
import Navbar from "@/components/reusable/navbar";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

type Props = {
  projects: any[];
  blogs: any[];
};

export default function HomeClient({ projects, blogs }: Props) {
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
          data={{ projects, blogs }}
          isLoadingError={true}
        />
      </main>
      <Footer />
    </Fragment>
  );
}
