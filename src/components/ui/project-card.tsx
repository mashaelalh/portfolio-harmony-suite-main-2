import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, AlertTriangle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

interface ProjectCardProps {
  title: string;
  description?: string;
  status: "not_started" | "in_progress" | "on_track" | "delayed" | "at_risk" | "completed" | "cancelled";
  progress?: number;
  startDate?: Date;
  endDate?: Date;
  team?: TeamMember[];
  risks?: number;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function ProjectCard({
  title,
  description,
  status,
  progress = 0,
  startDate,
  endDate,
  team = [],
  risks = 0,
  className,
  onClick,
  isLoading = false,
}: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden p-6 transition-shadow hover:shadow-lg",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {/* Top gradient decoration */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
          style={{
            opacity: isLoading ? 0.5 : 1,
          }}
        />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold tracking-tight">
                {isLoading ? (
                  <motion.div
                    className="h-6 w-48 animate-pulse rounded-md bg-muted"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                ) : (
                  title
                )}
              </h3>
              {description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="h-4 w-full animate-pulse rounded-md bg-muted"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <motion.div
                        className="mt-1 h-4 w-2/3 animate-pulse rounded-md bg-muted"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </>
                  ) : (
                    description
                  )}
                </p>
              )}
            </div>
            {!isLoading && <StatusBadge status={status} />}
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={isLoading ? undefined : progress} />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Dates */}
            {(startDate || endDate) && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {startDate && formatDate(startDate)}
                  {endDate && ` - ${formatDate(endDate)}`}
                </span>
              </div>
            )}

            {/* Team */}
            {team.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <div className="flex -space-x-2">
                  {team.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.length > 3 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                      +{team.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risks */}
            {risks > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{risks} risk{risks !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Usage example:
// <ProjectCard
//   title="Project Alpha"
//   description="A revolutionary project that will change the world"
//   status="in_progress"
//   progress={65}
//   startDate={new Date("2024-01-01")}
//   endDate={new Date("2024-12-31")}
//   team={[
//     { id: "1", name: "John Doe", avatarUrl: "/avatars/john.jpg" },
//     { id: "2", name: "Jane Smith", avatarUrl: "/avatars/jane.jpg" },
//   ]}
//   risks={2}
//   onClick={() => navigate(`/projects/${id}`)}
// />