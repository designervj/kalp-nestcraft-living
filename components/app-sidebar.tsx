"use client";

import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  ShoppingCart,
  LogOut,
  ListTree,
  ChevronUp,
  User2,
  Settings,
  Bell,
  Sparkles,
  FileText,
  Image,
  Inbox,
  Palette,
  Cpu,
  Users,
  Shield,
  Zap,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AppDispatch } from "@/lib/store/store";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { logoutThunk } from "@/lib/store/auth/authThunks";
import Link from "next/link";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
        badge: null,
      },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        exact: false,
        badge: null,
      },
      {
        label: "Branding",
        href: "/admin/branding",
        icon: Sparkles,
        exact: false,
        badge: null,
      },
      {
        label: "Theme",
        href: "/admin/theme",
        icon: Palette,
        exact: false,
        badge: null,
      },
      {
        label: "Inbox",
        href: "/admin/inbox",
        icon: Inbox,
        exact: false,
        badge: null,
      },
    ],
  },
  {
    group: "Store Management",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        exact: false,
        badge: null,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Layers,
        exact: false,
        badge: null,
      },
      {
        label: "Attributes",
        href: "/admin/attributes",
        icon: Tags,
        exact: false,
        badge: null,
      },
    ],
  },
  {
    group: "Content & Assets",
    items: [
      {
        label: "Pages",
        href: "/admin/pages",
        icon: FileText,
        exact: false,
        badge: null,
      },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: Image,
        exact: false,
        badge: null,
      },
      {
        label: "Data Synchronization",
        href: "/admin/sync",
        icon: Cpu,
        exact: false,
        badge: null,
      },
    ],
  },
  {
    group: "User Management",
    items: [
      {
        label: "Customer Base",
        href: "/admin/customers",
        icon: Users,
        exact: false,
        badge: null,
      },
      {
        label: "Administrative Team",
        href: "/admin/users",
        icon: Shield,
        exact: false,
        badge: null,
      },
      {
        label: "Dynamic Forms",
        href: "/admin/forms",
        icon: Zap,
        exact: false,
        badge: null,
      },
      {
        label: "Form Submissions",
        href: "/admin/form-submissions",
        icon: Database,
        exact: false,
        badge: null,
      },
    ],
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = async () => {
    const user = await dispatch(logoutThunk());
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar variant="inset">
      {/* Header */}
      <SidebarHeader className="h-20 flex px-6 items-center justify-center bg-transparent border-b border-slate-100">
        <div className="flex items-center gap-4 w-full">
          <div className="flex h-12 w-12 items-center border border-slate-100 p-2 justify-center rounded-none shadow-none ring-0">
          <img
            src="/assets/Image/favicon.svg"
            alt="Logo"
            className="w-10 h-10"
          />
        </div>
          <div className="flex flex-col">
            <span className="text-lg font-heading font-black uppercase text-slate-900 tracking-tight leading-none">
              Nest<span className="text-primary">craft</span>
            </span>
            <span className="text-[9px] font-black text-primary/60 tracking-[0.4em] uppercase">
              Admin Console
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="pt-6 gap-4">
        {NAV_ITEMS.map((group) => (
          <SidebarGroup key={group.group} className="px-4 py-2">
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 px-3 mb-3">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map(
                  ({ label, href, icon: Icon, exact, badge }) => {
                    const active = isActive(href, exact);
                    return (
                      <SidebarMenuItem key={href}>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-center gap-4 rounded-none px-4 h-12 w-full text-[13px] font-black uppercase tracking-widest transition-all duration-300",
                            active
                              ? "bg-primary text-white"
                              : "text-slate-400 hover:text-primary hover:bg-primary/5",
                          )}
                        >
                          <Icon
                            size={20}
                            strokeWidth={2.5}
                            className={cn(
                              "shrink-0 transition-colors",
                              active
                                ? "text-white"
                                : "text-slate-300 group-hover:text-primary",
                            )}
                          />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuItem>
                    );
                  },
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-6 mt-auto border-t border-slate-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-4 w-full rounded-none px-4 h-16 bg-white border border-slate-100 shadow-none hover:border-primary/30 transition-all group text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-primary/5 text-primary shrink-0 border border-primary/10">
                    <User2 size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-black text-[13px] text-slate-900 leading-none mb-1 uppercase tracking-tight">
                      Admin User
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
                      admin@nestcraft.com
                    </span>
                  </div>
                  <ChevronUp
                    size={18}
                    className="text-slate-300 shrink-0 group-hover:text-primary transition-colors"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={12}
                className="w-64 border border-slate-100 shadow-2xl rounded-none p-2 bg-white"
              >
                <DropdownMenuLabel className="px-4 py-4 bg-slate-50 rounded-none mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-none bg-primary/10 text-primary shadow-inner">
                      <User2 size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-black text-[13px] text-slate-900 uppercase tracking-tight">
                        Admin User
                      </p>
                      <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em]">
                        Superadmin
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-1" />
                <DropdownMenuItem
                  onClick={() => router.push("/admin/account-settings")}
                  className="cursor-pointer gap-2 py-2 rounded-none text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/5"
                >
                  <Settings size={15} />
                  <span className="font-medium">Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2 rounded-none text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/5">
                  <Bell size={15} />
                  <span className="font-medium">Notifications</span>
                  <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-none font-bold">
                    2
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50 my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 py-2 rounded-none text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut size={15} />
                  <span className="font-bold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
