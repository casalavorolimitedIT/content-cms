"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { cn } from "@/lib/utils";

function getRouteTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";
  const last = segments[segments.length - 1];
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  return (
    <div className="hidden lg:flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const label = seg
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-border">/</span>}
            <span
              className={cn(
                isLast
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = getRouteTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b border-border/50 bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />

          <div className="flex items-center gap-2.5 lg:hidden">
            <Image
              src="/casalavoro-logo.png"
              alt="Upstream"
              width={110}
              height={40}
              className="object-contain width-auto height-auto"
              priority
            />
          </div>

          <Breadcrumb pathname={pathname} />
        </div>

        <div className="lg:hidden">
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
            {title}
          </span>
        </div>
      </div>
    </header>
  );
}
