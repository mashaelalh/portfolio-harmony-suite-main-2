
import React, { ReactNode } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Search, HelpCircle, MoreHorizontal, Menu, Moon, Sun } from 'lucide-react'; // Removed Bell
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { CommandMenu } from '@/components/ui/CommandMenu';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import { NotificationCenter } from '@/components/ui/NotificationCenter'; // Import NotificationCenter
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
// DropdownMenu imports might be removed if no longer used elsewhere, but keep for now
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
const Header: React.FC<{ children?: ReactNode }> = ({ children }) => { // Remove title prop
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();
  // Removed handleNotifications and getNotificationCount logic, now handled by NotificationCenter

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-background/95 border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-2">
        {children}
        <BreadcrumbNavigation /> {/* Add BreadcrumbNavigation */}
        {user?.role && (
          <Badge variant="outline" className={`hidden md:flex ml-2 ${
            user.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            user.role === 'pm' ? 'bg-green-50 text-green-700 border-green-200' :
            'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            {user.role === 'admin' ? 'Administrator' : 
             user.role === 'pm' ? 'Project Manager' : 'Viewer'}
          </Badge>
        )}
      </div>
      
      <div className="md:flex items-center space-x-4 hidden">
        {/* Command Menu Integration */}
        <CommandMenu />
        
        {/* Existing Search Input - Consider replacing/integrating with CommandMenu later */}
        {/* <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 focus-visible:ring-primary"
          />
        </div> */}
        
        {/* Replace old notification button with NotificationCenter component */}
        <NotificationCenter />
        
        <Button variant="ghost" size="icon" asChild>
          <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
            <HelpCircle className="h-5 w-5" />
          </a>
        </Button>
        
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Mobile Navigation Drawer */}
      <div className="flex md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            {/* Keep mobile menu trigger, but remove notification badge from it */}
            <Button variant="ghost" size="icon" className="relative">
              <Menu className="h-5 w-5" />
               <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <SheetHeader className="mb-4">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-2">
               {/* Remove old notification button from mobile sheet */}
               <Button variant="ghost" className="justify-start" asChild>
                 <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
                   <HelpCircle className="h-4 w-4 mr-2" />
                   <span>Help</span>
                 </a>
               </Button>
               <Button variant="ghost" className="justify-start" onClick={toggleDarkMode}>
                 {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                 <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
               </Button>
               {/* Add other mobile navigation links here if needed */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
