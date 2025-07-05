"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, LogOut, Receipt, BookText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Memuat aplikasi...</p>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    // The useAuth hook handles redirection, but this prevents flashing the layout.
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  if (pathname === "/login" || pathname.includes("/print")) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="shadow-lg no-print">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              teknik
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
              <SidebarMenuItem>
                <Link href="/reports">
                  <SidebarMenuButton isActive={pathname === "/reports"} tooltip="Laporan">
                    <BookText />
                    <span>Laporan</span>
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
            <div className="flex justify-center p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2">
                <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="relative flex min-h-svh flex-1 flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden no-print">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">GUDANG MAJU SEJAHTRA</h1>
          </header>
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
