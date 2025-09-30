"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { NavList } from "@/lib/constant";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="w-full font-mono">
      <div className="@container">
        <nav className="flex items-center justify-between p-6 lg:px-12">
          <Link href="/">
            <div className="group flex items-center space-x-4">
              <div className="size-10 rounded-full overflow-hidden">
                <figure className="isolate z-[1] overflow-hidden select-none pointer-events-none object-cover">
                  <div
                    style={{
                      position: "relative",
                      height: 0,
                      paddingTop: "100%",
                      cursor: "default",
                    }}
                  >
                    <div className="jsx-496024066 absolute left-0 top-0">
                      <Image
                        alt="Habibie"
                        title="Habibie"
                        loading="lazy"
                        width={350}
                        height={350}
                        decoding="async"
                        src="https://atoknuupgrcxghtwmogg.supabase.co/storage/v1/object/public/profile/Foto.png"
                      />
                    </div>
                  </div>
                </figure>
              </div>
              <h2 className="text-lg font-semibold">The Bibi</h2>
            </div>
          </Link>
          <ul className="hidden lg:flex lg:space-x-12">
            {NavList.map((item, _) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li
                  key={_ + 1}
                  className={clsx(
                    "transition-colors capitalize",
                    isActive
                      ? "text-destructive underline"
                      : "hover:underline transition-all"
                  )}
                >
                  <Link href={item.href}>{item.name}</Link>{" "}
                </li>
              );
            })}
          </ul>
          <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="outline" size={"icon"}>
                <Icons.Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit font-mono" align="end">
              <DropdownMenuGroup>
                {NavList.map((item, _) => (
                  <DropdownMenuItem
                    key={_ + 1}
                    className="capitalize justify-end"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
