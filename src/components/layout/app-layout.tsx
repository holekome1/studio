"use client";

import { useEffect, useState } from "react";
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn !== "true" && pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, [pathname, router, isClient]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.replace("/login");
  };
  
  if (!isClient || (pathname !== "/login" && localStorage.getItem("isLoggedIn") !== "true")) {
    return null; // Or a loading spinner
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
                <Link href="/" legacyBehavior passHref>
                  <SidebarMenuButton isActive={pathname === "/"} tooltip="Inventaris">
                    <Package />
                    <span>Inventaris</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/transactions" legacyBehavior passHref>
                  <SidebarMenuButton isActive={pathname === "/transactions"} tooltip="Transaksi">
                    <Receipt />
                    <span>Transaksi</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <SidebarMenuButton isActive={pathname === "/dashboard"} tooltip="Dasbor">
                    <LayoutDashboard />
                    <span>Dasbor</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                 <SidebarMenuButton onClick={handleLogout} tooltip="Keluar">
                    <LogOut />
                    <span>Keluar</span>
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
