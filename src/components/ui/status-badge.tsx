import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  HelpCircle,
} from "lucide-react";

type StatusType =
  | "not_started"
  | "in_progress"
  | "on_track"
  | "delayed"
  | "at_risk"
  | "on_hold"
  | "completed"
  | "cancelled";

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  not_started: {
    label: "Not Started",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: <PlayCircle className="h-3.5 w-3.5" />,
  },
  on_track: {
    label: "On Track",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  delayed: {
    label: "Delayed",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  at_risk: {
    label: "At Risk",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  on_hold: {
    label: "On Hold",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    icon: <PauseCircle className="h-3.5 w-3.5" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfigs[status] || {
    label: "Unknown",
    color: "bg-gray-100 text-gray-700",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1 font-medium",
        config.color,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}

// Usage example:
// <StatusBadge status="in_progress" />
// <StatusBadge status="completed" showIcon={false} size="lg" />