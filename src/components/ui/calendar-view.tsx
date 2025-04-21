import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "milestone" | "deadline" | "meeting" | "other";
  status?: "not_started" | "in_progress" | "completed" | "delayed";
  description?: string;
  projectId?: string;
  projectName?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const eventTypeIcons = {
  milestone: Flag,
  deadline: CalendarIcon,
  meeting: CalendarIcon,
  other: CalendarIcon,
};

const eventTypeColors = {
  milestone: "bg-primary text-primary-foreground",
  deadline: "bg-destructive text-destructive-foreground",
  meeting: "bg-muted text-muted-foreground",
  other: "bg-accent text-accent-foreground",
};

export function CalendarView({
  events,
  onEventClick,
  onDateSelect,
  className,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  const daysWithEvents = React.useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });

    return days.map((day) => {
      const dayEvents = events.filter((event) =>
        isSameDay(new Date(event.date), day)
      );
      return {
        date: day,
        events: dayEvents,
      };
    });
  }, [currentMonth, events]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onDateSelect?.(date);
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TooltipProvider>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
            components={{
              Day: ({ date, ...props }) => {
                const dayEvents = events.filter((event) =>
                  isSameDay(new Date(event.date), date)
                );

                return (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "h-9 w-9 p-0 font-normal",
                            !isSameMonth(date, currentMonth) &&
                              "text-muted-foreground",
                            dayEvents.length > 0 &&
                              "relative bg-primary/10 font-medium hover:bg-primary/20"
                          )}
                          {...props}
                        >
                          <time dateTime={format(date, "yyyy-MM-dd")}>
                            {format(date, "d")}
                          </time>
                          {dayEvents.length > 0 && (
                            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                              {dayEvents.slice(0, 3).map((event, index) => (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "h-1 w-1 rounded-full",
                                    eventTypeColors[event.type]
                                  )}
                                />
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="h-1 w-1 rounded-full bg-muted" />
                              )}
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {dayEvents.length > 0 && (
                        <TooltipContent>
                          <div className="space-y-2">
                            {dayEvents.map((event) => {
                              const Icon = eventTypeIcons[event.type];
                              return (
                                <div
                                  key={event.id}
                                  className="flex items-center gap-2"
                                  onClick={() => onEventClick?.(event)}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span>{event.title}</span>
                                  {event.status && (
                                    <StatusBadge
                                      status={event.status}
                                      size="sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </motion.div>
                );
              },
            }}
          />
        </TooltipProvider>

        {/* Selected Date Events */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h4 className="font-medium">
                Events for {format(selectedDate, "MMMM d, yyyy")}
              </h4>
              {events
                .filter((event) =>
                  isSameDay(new Date(event.date), selectedDate)
                )
                .map((event) => {
                  const Icon = eventTypeIcons[event.type];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50",
                        onEventClick && "cursor-pointer"
                      )}
                      onClick={() => onEventClick?.(event)}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        {event.projectName && (
                          <div className="text-sm text-muted-foreground">
                            {event.projectName}
                          </div>
                        )}
                      </div>
                      {event.status && <StatusBadge status={event.status} />}
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// Usage example:
// const events = [
//   {
//     id: "1",
//     title: "Project Kickoff",
//     date: new Date("2024-04-15"),
//     type: "milestone",
//     status: "completed",
//     projectName: "Project Alpha",
//   },
//   {
//     id: "2",
//     title: "Design Review",
//     date: new Date("2024-04-15"),
//     type: "meeting",
//     projectName: "Project Beta",
//   },
// ];
// <CalendarView
//   events={events}
//   onEventClick={(event) => console.log("Event clicked:", event)}
//   onDateSelect={(date) => console.log("Date selected:", date)}
// />