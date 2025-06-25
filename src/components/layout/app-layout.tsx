
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { LayoutDashboard, Package, LogOut, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router, user, isLoading]);

  if (isLoading || (pathname !== "/login" && !user)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Memuat aplikasi...</p>
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="shadow-lg">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-sidebar-primary-foreground" />
              <h1 className="text-xl font-headline font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
                GUDANG MAJU SEJAHTRA
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton isActive={pathname === "/dashboard"} tooltip="Dasbor">
                    <LayoutDashboard />
                    <span>Dasbor</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/">
                  <SidebarMenuButton isActive={pathname === "/"} tooltip="Inventaris">
                    <Package />
                    <span>Inventaris</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/transactions">
                  <SidebarMenuButton isActive={pathname === "/transactions"} tooltip="Transaksi">
                    <Receipt />
                    <span>Transaksi</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                 <SidebarMenuButton onClick={logout} tooltip="Keluar">
                    <LogOut />
                    <span>Keluar ({user?.username})</span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">GUDANG MAJU SEJAHTRA</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
