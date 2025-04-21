import * as React from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  CalendarDays,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
  toggleSidebar?: () => void;
  closeMobileMenu?: () => void;
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export function Sidebar({ isCollapsed, isMobile, toggleSidebar, closeMobileMenu }: SidebarProps) {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard"
    },
    {
      title: "Portfolios",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/portfolios"
    },
    {
      title: "Projects",
      icon: <FolderKanban className="h-5 w-5" />,
      href: "/projects",
      badge: 12
    },
    {
      title: "Reports",
      icon: <BarChart2 className="h-5 w-5" />,
      href: "/reports"
    },
    {
      title: "Teams",
      icon: <Users className="h-5 w-5" />,
      href: "/teams"
    },
    {
      title: "Risk Register",
      icon: <AlertTriangle className="h-5 w-5" />,
      href: "/risks",
      badge: 3
    },
    {
      title: "Calendar",
      icon: <CalendarDays className="h-5 w-5" />,
      href: "/calendar"
    }
  ];

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? "64px" : "256px",
      }}
      className={cn(
        "flex h-screen flex-col border-r bg-card",
        isMobile && "fixed inset-y-0 left-0 z-50"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 py-4">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-lg"
          >
            Portfolio Hub
          </motion.div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-1 px-2 py-2">
          {navItems.map((item) => (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.href}
                  onClick={isMobile ? closeMobileMenu : undefined}
                  className={({ isActive }) => {
                    const icon = React.cloneElement(item.icon as React.ReactElement, {
                      className: cn("h-5 w-5", isActive && "text-accent-foreground")
                    });
                    
                    return cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                      isActive && "bg-accent text-accent-foreground border-l-4 border-primary",
                      isCollapsed && "justify-center"
                    );
                  }}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="flex-1">{item.title}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="flex items-center gap-4">
                  {item.title}
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </ScrollArea>
      <motion.div
        initial={false}
        animate={{ height: isCollapsed ? "64px" : "80px" }}
        className="border-t p-4"
      >
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <div className="flex flex-col">
                <span className="font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </motion.div>
    </motion.div>
  );
}
