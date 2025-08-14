import { Icons } from "@/components/icons";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import Navbar from "@/components/reusable/navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavList, SocialMediaList } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn("inset-x-0 inset-y-[-30%] -z-50 h-full skew-y-12")}
      />
      <Navbar />
      <main className="">
        <section className="mx-auto w-full max-w-6xl">
          <article className="space-y-4 lg:pb-24 lg:py-12">
            <h1 className="font-bold tracking-tight font-mono text-5xl">
              Featured{" "}
              <span className="underline-offset-1 underline">Projects</span>
            </h1>
            <p className="text-neutral-500 italic">
              Core projects with ongoing attention and long-term goals.
            </p>
          </article>
          <article className="space-y-4 lg:pb-24 lg:py-12">
            <h1 className="font-bold tracking-tight font-mono text-5xl">
              Featured{" "}
              <span className="underline-offset-1 underline">Posts</span>
            </h1>
            <p className="text-neutral-500 italic">
              Core projects with ongoing attention and long-term goals.
            </p>
          </article>
        </section>
      </main>
      <footer className="">
        <Separator
          orientation="horizontal"
          className="bg-gradient-to-r from-[#f5f5f5] via-[#e5e5e5] to-[#f5f5f5]"
        />
        <div className="font-mono @container w-full shrink-0 bg-neutral-50 text-sm px-24 py-8 grid md:grid-cols-2 gap-8 md:gap-16">
          <div>
            <h4 className="text-lg">Habibie Bayezid Wildan</h4>
            <p className="mt-3 text-muted-foreground">
              Help you rebuild and redefine fundamental concepts through mental
              models.
            </p>
            <div className="flex gap-3 mt-6">
              {SocialMediaList.map((item, _) => (
                <Tooltip key={_ + 1}>
                  <TooltipTrigger asChild>
                    <Button asChild size={"icon"} variant={"ghost"}>
                      <Link href={item.link}>{item.icon}</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="@container">
            <div className="@sm:grid-cols-3 grid-cols-2 grid gap-4 gap-y-10">
              <div>
                <p className="text-sm ">General</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {NavList.map((item, _) => (
                    <li key={_ + 1} className="capitalize">
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-neutral-500">The Website</p>
                <ul className="text-neutral-300 mt-4 space-y-3 text-sm">
                  <li>
                    <a
                      className="hover:text-neutral-50 transition-colors"
                      href="/bucket-list"
                    >
                      Bucket List
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-neutral-50 transition-colors"
                      href="/uses"
                    >
                      Uses
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-neutral-50 transition-colors"
                      href="/side-quests"
                    >
                      Side Quests
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-neutral-50 transition-colors"
                      href="/attribution"
                    >
                      Attribution
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-neutral-50 transition-colors"
                      href="/statistics"
                    >
                      Statistics
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-neutral-50 transition-colors"
                      href="/guestbook"
                    >
                      Guest Book
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
