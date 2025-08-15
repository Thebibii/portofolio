import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavList, SocialMediaList } from "@/lib/constant";
import Link from "next/link";

export default function Footer() {
  return (
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
                  <Link
                    className="hover:text-neutral-50 transition-colors"
                    href="/bucket-list"
                  >
                    Bucket List
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-neutral-50 transition-colors"
                    href="/uses"
                  >
                    Uses
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-neutral-50 transition-colors"
                    href="/side-quests"
                  >
                    Side Quests
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-neutral-50 transition-colors"
                    href="/attribution"
                  >
                    Attribution
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-neutral-50 transition-colors"
                    href="/statistics"
                  >
                    Statistics
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-neutral-50 transition-colors"
                    href="/guestbook"
                  >
                    Guest Book
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
