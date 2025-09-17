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
  HelpCircle,
  IndianRupee,
  LayoutDashboard,
  Network,
  NotebookText,
  Projector,
  Settings,
  Tags,
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
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      collapsible: false,
    },
    {
      title: "Project",
      url: "/admin/project",
      icon: Projector,
      collapsible: false,
    },
    {
      title: "Writings",
      url: "/admin/writings",
      icon: NotebookText,
      collapsible: false,
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: Folder,
      collapsible: false,
    },
    {
      title: "About",
      url: "/admin/about",
      icon: Network,
      collapsible: true,
      items: [
        {
          title: "Experiences",
          url: "/admin/about/experiences",
        },
        {
          title: "Current Activity",
          url: "/admin/about/current-activities",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Categories",
      url: "/admin/categories",
      icon: Folder,
    },
    {
      title: "Tags",
      url: "/admin/tags",
      icon: Tags,
    },
  ],
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
                <span className="text-base font-semibold">The Bibi</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
