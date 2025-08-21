import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import Footer from "@/components/reusable/home/footer";
import Navbar from "@/components/reusable/navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Fragment } from "react";

export default function NotFound() {
  return (
    <Fragment>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn("inset-x-0 inset-y-[-30%] -z-50 h-full skew-y-12")}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow font-mono flex items-center justify-center">
          <div className="flex items-center justify-center flex-col space-y-4">
            <h1 className="text-4xl font-bold ">404</h1>
            <p className="text-primary font-semibold text-3xl text-wrap text-center">
              Looks like you've taken a wrong turn.
            </p>
            <Link href={"/"} className="hover:underline">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}
