import { Home, Users, BookOpen, Calendar } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AdSenseBanner } from "@/components/AdSenseBanner";

const navigationItems = [
  { title: "Age Calculator", url: "/", icon: Home },
  { title: "Famous Birthdays", url: "/famous-birthdays", icon: Users },
  { title: "Blog", url: "/blog", icon: BookOpen },
];

export function AppSidebar() {
  const { open } = useSidebar();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Calendar className="w-4 h-4 mr-2" />
            {open && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sidebar Ads - Only show when sidebar is open */}
        {/* {open && (
          <div className="space-y-4 mt-6 px-2">
            <AdSenseBanner format="vertical" />
            <AdSenseBanner format="square" />
          </div>
        )} */}
      </SidebarContent>
    </Sidebar>
  );
}
