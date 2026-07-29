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
    <footer className="bg-neutral-50 text-sm ">
      <Separator
        orientation="horizontal"
        className="bg-gradient-to-r from-[#f5f5f5] via-[#e5e5e5] to-[#f5f5f5]"
      />
      <div className="font-mono @container w-full shrink-0  px-6 md:px-8 lg:px-24 py-8 grid md:grid-cols-2 gap-8 md:gap-16">
        {/* Column 1: About */}
        <div>
          <h2 className="text-lg">Habibie Bayezid Wildan</h2>
          <p className="mt-3 text-muted-foreground">
            Membantu Anda membangun ulang dan mendefinisikan ulang konsep fundamental
            melalui model mental.
          </p>
          <div className="flex gap-3 mt-6">
            {SocialMediaList.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button asChild size={"icon"} variant={"ghost"}>
                    <Link href={item.link} aria-label={item.name}>
                      {item.icon}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="@container">
          <div className="@sm:grid-cols-3 grid-cols-2 grid gap-4 gap-y-10">
            {/* General Links */}
            <nav aria-label="Tautan umum">
              <p className="text-sm font-semibold">Umum</p>
              <ul className="mt-4 space-y-3 text-sm">
                {NavList.map((item, index) => (
                  <li key={index} className="capitalize">
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* The Website Links */}
            <nav aria-label="Tautan situs">
              <p className="text-sm font-semibold">Situs</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary  transition-colors"
                  >
                    Bucket List
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary  transition-colors"
                  >
                    Perlengkapan
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary  transition-colors"
                  >
                    Atribusi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guestbook"
                    className="text-muted-foreground hover:text-primary  transition-colors"
                  >
                    Buku Tamu
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
