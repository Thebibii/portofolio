"use client";

import { Button } from "@/components/ui/button";
import { type LucideIcon, ChevronDown, ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    collapsible?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(`${item.url}/`);
            const isOpen = openItems.includes(item.title);

            // Item yang tidak collapsible
            if (!item.collapsible || !item.items) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    className={clsx(
                      "transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-accent"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Item yang collapsible
            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleItem(item.title)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={clsx(
                        "transition-colors w-full",
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/80"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={clsx(
                                "transition-colors",
                                isSubActive
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
