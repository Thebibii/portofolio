import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import Footer from "@/components/reusable/home/footer";
import Navbar from "@/components/reusable/navbar";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "inset-x-0 inset-y-[-30%]  opacity-40 -z-50 h-full skew-y-12"
        )}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </Fragment>
  );
}
