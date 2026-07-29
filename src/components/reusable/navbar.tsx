"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { NavList } from "@/lib/constant";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  FolderKanban,
  FileText,
  User,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (moreOpen) setMoreOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [moreOpen]);

  const mobileItems = [
    {
      name: "Projek",
      href: "/projects",
      icon: FolderKanban,
      description: "Kumpulan karya saya",
    },
    {
      name: "Tulisan",
      href: "/writings",
      icon: FileText,
      description: "Pikiran dan ide",
    },
    {
      name: "Blog",
      href: "/blogs",
      icon: Icons.BookOpen,
      description: "Artikel mendalam",
    },
    {
      name: "Tentang",
      href: "/about",
      icon: User,
      description: "Kenali saya",
    },
    {
      name: "Buku Tamu",
      href: "/guestbook",
      icon: MessageSquare,
      description: "Tinggalkan pesan atau sapa",
    },
    {
      name: "Statistik",
      href: "/statistics",
      icon: Icons.ChartNoAxesCombined,
      description: "Analitik dan wawasan situs",
    },
  ];

  const moreItems = [
    {
      name: "Buku Tamu",
      href: "/guestbook",
      icon: Icons.BookOpen,
      description: "Tinggalkan pesan atau sapa",
    },
    {
      name: "Statistik",
      href: "/statistics",
      icon: Icons.ChartNoAxesCombined,
      description: "Analitik dan wawasan situs",
    },
  ];

  return (
    <header className="w-full font-mono">
      <div className="@container">
        <nav className="flex items-center justify-between p-6 md:px-12">
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
          <ul className="hidden md:flex md:space-x-6 lg:space-x-12">
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
                      : "hover:underline transition-all",
                  )}
                >
                  <Link href={item.href}>{item.name}</Link>{" "}
                </li>
              );
            })}
            <li className="transition-colors capitalize hover:underline transition-all">
              <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                <PopoverTrigger asChild>
                  <button>Lainnya</button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={24}
                  className="w-fit p-3"
                >
                  <div className="grid gap-2">
                    {moreItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <item.icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </li>
          </ul>
          <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden fixed top-6 right-6 z-50 gap-2 bg-background/50 border border-muted-foreground/50 backdrop-blur-sm"
              >
                <span>Menu</span>
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="up"
                      initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="size-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="down"
                      initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="size-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit font-mono" align="end">
              <div className="grid gap-2 p-3">
                {mobileItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <item.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
