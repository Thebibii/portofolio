"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import {
  Folder,
  IndianRupee,
  LayoutDashboard,
  Network,
  NotebookText,
  Projector,
} from "lucide-react";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      title: "Project",
      url: "/admin/project",
      icon: Projector,
    },
    {
      title: "Writing",
      url: "#",
      icon: NotebookText,
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: Folder,
    },
    {
      title: "Now",
      url: "#",
      icon: Network,
    },
  ],
  //   navSecondary: [
  //     {
  //       title: "Settings",
  //       url: "#",
  //       icon: Setting,
  //     },
  //     {
  //       title: "Get Help",
  //       url: "#",
  //       icon: IconHelp,
  //     },
  //     {
  //       title: "Search",
  //       url: "#",
  //       icon: IconSearch,
  //     },
  //   ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IndianRupee className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
