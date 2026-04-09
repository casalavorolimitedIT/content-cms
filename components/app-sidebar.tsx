"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Globe02FreeIcons,
  SendHorizontal,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const nav_items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: DashboardSquare01Icon,
  },
  {
    title: "Linked Websites",
    url: "/dashboard/websites",
    icon: Globe02FreeIcons,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-border/40 bg-background"
      {...props}
    >
      <SidebarHeader className="px-4 py-5 border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex items-center gap-2.5 group outline-none"
            >
              <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground/5 ring-1 ring-border/60 transition-all duration-200 group-hover:ring-foreground/20">
                <Image
                  src="/logo.png"
                  alt="Upstream logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold tracking-tight text-foreground">
                  Upstream
                </span>
                <span className="text-[10px] mt-1 font-medium tracking-widest text-muted-foreground/70 uppercase">
                  Blog CMS
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
          Menu
        </p>

        <SidebarMenu>
          {nav_items.map((item) => {
            const isActive =
              item.url === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <Link
                  href={item.url}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 outline-none",
                    isActive
                      ? "bg-primary text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="size-4 shrink-0"
                  />
                  {item.title}
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 px-3 py-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
