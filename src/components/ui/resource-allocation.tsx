import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Project {
  id: string;
  name: string;
  allocation: number; // Percentage of time allocated
  startDate: Date;
  endDate: Date;
}

interface Resource {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  department?: string;
  projects: Project[];
  capacity: number; // Total capacity in hours per week
  utilized: number; // Currently utilized hours per week
}

interface ResourceAllocationProps {
  resources: Resource[];
  className?: string;
  onResourceClick?: (resource: Resource) => void;
  onProjectClick?: (project: Project) => void;
}

const getUtilizationColor = (percentage: number): string => {
  if (percentage <= 70) return "text-success";
  if (percentage <= 90) return "text-warning";
  return "text-destructive";
};

const getProgressColor = (percentage: number): string => {
  if (percentage <= 70) return "bg-success";
  if (percentage <= 90) return "bg-warning";
  return "bg-destructive";
};

export function ResourceAllocation({
  resources,
  className,
  onResourceClick,
  onProjectClick,
}: ResourceAllocationProps) {
  const sortedResources = [...resources].sort((a, b) => {
    const utilizationA = (a.utilized / a.capacity) * 100;
    const utilizationB = (b.utilized / b.capacity) * 100;
    return utilizationB - utilizationA;
  });

  return (
    <TooltipProvider>
      <Card className={cn("p-6", className)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Resource Allocation</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span>Near Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span>Overallocated</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sortedResources.map((resource) => {
              const utilization = (resource.utilized / resource.capacity) * 100;
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => onResourceClick?.(resource)}
                    >
                      <Avatar>
                        <AvatarImage src={resource.avatarUrl} alt={resource.name} />
                        <AvatarFallback>
                          {resource.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {resource.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-sm font-medium", getUtilizationColor(utilization))}>
                        {Math.round(utilization)}% Utilized
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {resource.utilized}h / {resource.capacity}h per week
                      </div>
                    </div>
                  </div>

                  {/* Project Allocations */}
                  <div className="relative h-6 overflow-hidden rounded-full bg-muted">
                    {resource.projects.map((project, index) => {
                      const width = `${project.allocation}%`;
                      const left = resource.projects
                        .slice(0, index)
                        .reduce((acc, p) => acc + p.allocation, 0);

                      return (
                        <Tooltip key={project.id}>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={cn(
                                "absolute top-0 h-full cursor-pointer transition-opacity hover:opacity-80",
                                getProgressColor(utilization)
                              )}
                              style={{
                                width,
                                left: `${left}%`,
                                opacity: 0.2 + (index * 0.2),
                              }}
                              onClick={() => onProjectClick?.(project)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div className="font-medium">{project.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {project.allocation}% Allocation
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(project.startDate).toLocaleDateString()} -{" "}
                                {new Date(project.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>

                  {/* Show projects on hover */}
                  <AnimatePresence>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden text-sm"
                    >
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {resource.projects.map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-1"
                          >
                            <span>{project.name}</span>
                            <span className="text-muted-foreground">
                              {project.allocation}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}

// Usage example:
// const resources = [
//   {
//     id: "1",
//     name: "John Doe",
//     role: "Senior Developer",
//     avatarUrl: "/avatars/john.jpg",
//     department: "Engineering",
//     capacity: 40,
//     utilized: 35,
//     projects: [
//       {
//         id: "p1",
//         name: "Project Alpha",
//         allocation: 50,
//         startDate: new Date("2024-01-01"),
//         endDate: new Date("2024-06-30"),
//       },
//       {
//         id: "p2",
//         name: "Project Beta",
//         allocation: 30,
//         startDate: new Date("2024-02-01"),
//         endDate: new Date("2024-12-31"),
//       },
//     ],
//   },
// ];
// <ResourceAllocation
//   resources={resources}
//   onResourceClick={(resource) => console.log("Resource clicked:", resource)}
//   onProjectClick={(project) => console.log("Project clicked:", project)}
// />