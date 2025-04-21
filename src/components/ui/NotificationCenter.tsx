import React from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';

// Placeholder notification type
interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: Date;
}

// Placeholder data
const placeholderNotifications: Notification[] = [
  { id: '1', title: 'New Project Assigned', description: 'Project "Apollo" needs your review.', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', title: 'Milestone Due Soon', description: 'Milestone "Phase 1 Completion" for project "Zeus" is due tomorrow.', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', title: 'Budget Alert', description: 'Project "Athena" is nearing its budget limit.', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

export function NotificationCenter() {
  // In a real app, fetch notifications from a store or API
  const [notifications, setNotifications] = React.useState<Notification[]>(placeholderNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // TODO: Add API call to mark as read on the backend
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
     // TODO: Add API call to mark all as read on the backend
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
              {unreadCount}
            </Badge>
          )}
           <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
           <h4 className="font-medium text-sm">Notifications</h4>
           {unreadCount > 0 && (
             <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={markAllAsRead}>
               Mark all as read
             </Button>
           )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
             <p className="text-sm text-muted-foreground p-4 text-center">No new notifications</p>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <div className={cn(
                  "p-4 hover:bg-muted/50",
                  !notification.read && "bg-primary/5 hover:bg-primary/10"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1 h-2 w-2 rounded-full", notification.read ? "bg-transparent" : "bg-primary")} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70">
                        {/* Basic time formatting */}
                        {Math.round((Date.now() - notification.timestamp.getTime()) / (1000 * 60))} mins ago
                      </p>
                    </div>
                    {!notification.read && (
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-6 w-6 text-muted-foreground hover:text-primary"
                         onClick={(e) => {
                           e.stopPropagation(); // Prevent popover closing
                           markAsRead(notification.id);
                         }}
                         aria-label="Mark as read"
                       >
                         <Check className="h-4 w-4" />
                       </Button>
                    )}
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </React.Fragment>
            ))
          )}
        </div>
         {/* Optional Footer */}
         {/* <div className="p-2 border-t text-center">
           <Button variant="link" size="sm" className="text-xs">View all notifications</Button>
         </div> */}
      </PopoverContent>
    </Popover>
  );
}