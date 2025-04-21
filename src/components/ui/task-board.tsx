import * as React from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  assignees?: Assignee[];
  tags?: string[];
  blockers?: string[];
}

interface Column {
  id: string;
  title: string;
  status: Task["status"];
  tasks: Task[];
}

interface TaskBoardProps {
  columns: Column[];
  onTaskMove: (taskId: string, source: string, destination: string) => void;
  onTaskClick?: (task: Task) => void;
  className?: string;
}

const priorityColors = {
  low: "bg-success/10 text-success hover:bg-success/20",
  medium: "bg-warning/10 text-warning hover:bg-warning/20",
  high: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  urgent: "bg-destructive/10 text-destructive hover:bg-destructive/20",
};

function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card
        className={cn(
          "group space-y-3 p-4 transition-shadow hover:shadow-md",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium line-clamp-2">{task.title}</h4>
          <div
            className={cn(
              "rounded px-2 py-1 text-xs font-medium",
              priorityColors[task.priority]
            )}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              {isOverdue ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span className={cn(isOverdue && "text-destructive")}>
                {formatDistanceToNow(new Date(task.dueDate), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((assignee) => (
                <Tooltip key={assignee.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={assignee.avatarUrl} />
                      <AvatarFallback>
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{assignee.name}</TooltipContent>
                </Tooltip>
              ))}
              {task.assignees.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}

          {task.blockers && task.blockers.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {task.blockers.length} Blocker{task.blockers.length !== 1 && "s"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <div className="font-medium">Blockers:</div>
                  <ul className="list-inside list-disc">
                    {task.blockers.map((blocker, index) => (
                      <li key={index} className="text-sm">{blocker}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <div
                key={tag}
                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function TaskBoard({
  columns,
  onTaskMove,
  onTaskClick,
  className,
}: TaskBoardProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "grid auto-cols-[minmax(300px,1fr)] grid-flow-col gap-4",
          className
        )}
      >
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{column.title}</h3>
              <div className="rounded-full bg-muted px-2 py-1 text-sm text-muted-foreground">
                {column.tasks.length}
              </div>
            </div>
            <Reorder.Group
              axis="y"
              values={column.tasks}
              onReorder={(tasks) =>
                onTaskMove(tasks[0].id, column.status, column.status)
              }
              className="space-y-3"
            >
              <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border bg-muted/50 p-2">
                <AnimatePresence>
                  {column.tasks.map((task) => (
                    <Reorder.Item key={task.id} value={task}>
                      <TaskCard
                        task={task}
                        onClick={() => onTaskClick?.(task)}
                      />
                    </Reorder.Item>
                  ))}
                  {column.tasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-24 items-center justify-center rounded-md border-2 border-dashed text-sm text-muted-foreground"
                    >
                      No tasks
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </Reorder.Group>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}

// Usage example:
// const columns = [
//   {
//     id: "todo",
//     title: "To Do",
//     status: "todo",
//     tasks: [
//       {
//         id: "1",
//         title: "Implement authentication",
//         description: "Set up user authentication with OAuth",
//         status: "todo",
//         priority: "high",
//         dueDate: new Date("2024-04-20"),
//         assignees: [
//           { id: "1", name: "John Doe", avatarUrl: "/avatars/john.jpg" }
//         ],
//         tags: ["auth", "security"],
//       },
//     ],
//   },
//   // ... other columns
// ];
// <TaskBoard
//   columns={columns}
//   onTaskMove={(taskId, source, destination) =>
//     console.log("Task moved:", { taskId, source, destination })
//   }
//   onTaskClick={(task) => console.log("Task clicked:", task)}
// />