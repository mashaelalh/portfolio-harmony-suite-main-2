import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  title?: string;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden md:flex-row">
      {/* Desktop Sidebar */}
      <div className={`hidden md:block transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <Sidebar isCollapsed={!sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Mobile Sidebar (Overlay) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      />
      
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isMobile={true} closeMobileMenu={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Removed undefined ThemeToggle and UserNav components */}
              {/* Theme toggle and user nav should be handled within the Header component */}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 animate-fadeIn"> {/* Added fade-in animation class */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
