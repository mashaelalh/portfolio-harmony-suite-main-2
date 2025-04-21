import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  PlusCircle,
  Settings,
  User,
  Calendar, // Keep existing icons if needed
  Search,
  Smile,
  Calculator,
} from 'lucide-react'; // Import necessary icons
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // useCallback to memoize the runCommand function
  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* This button can be integrated into the header later */}
      {/* <Button
        variant="outline"
        className="h-9 w-9 p-0"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search className="h-4 w-4" />
      </Button> */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/projects'))}>
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/portfolios'))}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Portfolios</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
             <CommandItem onSelect={() => runCommand(() => navigate('/projects/new'))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Create New Project</span>
            </CommandItem>
             <CommandItem onSelect={() => runCommand(() => navigate('/portfolios/new'))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Create New Portfolio</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          {/* Keep placeholder settings for now */}
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => alert('Navigate to Profile (Not Implemented)'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => alert('Navigate to Settings (Not Implemented)'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            {/* Example placeholder items */}
            {/* <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Calculator</span>
            </CommandItem> */}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}