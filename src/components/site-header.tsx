"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/project": "Projects",
  "/admin/project/create": "Create Project",
  "/admin/blogs": "Blogs",
  "/admin/blogs/create": "Create Blog",
  "/admin/writings": "Writings",
  "/admin/writings/create": "Create Writing",
  "/admin/categories": "Categories",
  "/admin/tags": "Tags",
  "/admin/about": "About",
  "/admin/about/experiences": "Experiences",
  "/admin/about/current-activities": "Current Activities",
};

export function SiteHeader() {
  const pathname = usePathname();

  const title = Object.entries(pageTitles).reduce<{ prefix: string; label: string }>((best, [prefix, label]) => {
    if (pathname.startsWith(prefix) && prefix.length > best.prefix.length) {
      return { prefix, label };
    }
    return best;
  }, { prefix: "", label: "Admin" }).label;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link
              href="/"
              rel="noopener noreferrer"
              className="dark:text-foreground"
            >
              Home
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
