import { redirectIfNotAuthenticated } from "@/lib/redirect/redirectIfNotAuthenticated";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import QuickAdd from "@/components/quick-add";
import { UserProvider } from "@/contexts/userContext";
import { PostProvider } from "@/contexts/postContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfNotAuthenticated();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const roles: string[] = user?.user_metadata?.roles ?? [];

  return (
    <PostProvider>
      <UserProvider initialUser={{ user }}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar
            variant="inset"
            className="shadow-md shadow-black/20 bg-white"
          />
          <SidebarInset>
            <SiteHeader />
            <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </main>
          </SidebarInset>
          <QuickAdd roles={roles} />
        </SidebarProvider>
      </UserProvider>
    </PostProvider>
  );
}
