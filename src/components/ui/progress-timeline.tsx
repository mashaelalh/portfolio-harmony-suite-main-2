import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming" | "delayed";
  date?: string;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function ProgressTimeline({
  steps,
  className,
  orientation = "horizontal",
}: ProgressTimelineProps) {
  const isVertical = orientation === "vertical";

  const getStepIcon = (status: TimelineStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-success" />;
      case "current":
        return <Circle className="h-6 w-6 text-primary animate-pulse" />;
      case "delayed":
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "relative",
        isVertical ? "space-y-4" : "flex items-center gap-4",
        className
      )}
    >
      {/* Progress Line */}
      <div
        className={cn(
          "absolute bg-muted",
          isVertical
            ? "left-3 top-0 h-full w-0.5"
            : "left-0 top-1/2 h-0.5 w-full -translate-y-1/2"
        )}
      >
        <motion.div
          className="bg-primary h-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: steps.filter((step) => step.status === "completed").length / (steps.length - 1),
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Steps */}
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          className={cn(
            "relative flex",
            isVertical ? "items-start gap-4" : "flex-col items-center"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full bg-background p-1",
                  step.status === "completed" && "text-success",
                  step.status === "current" && "text-primary",
                  step.status === "delayed" && "text-destructive"
                )}
              >
                {getStepIcon(step.status)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{step.title}</p>
                {step.description && (
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                )}
                {step.date && (
                  <p className="text-xs text-muted-foreground">{step.date}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          <div
            className={cn(
              "min-w-[100px] text-sm",
              isVertical ? "pt-1" : "mt-2 text-center"
            )}
          >
            <div className="font-medium">{step.title}</div>
            {step.date && (
              <div className="text-xs text-muted-foreground">{step.date}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Usage example:
// const steps = [
//   {
//     id: "1",
//     title: "Planning",
//     description: "Project planning phase",
//     status: "completed",
//     date: "2024-01-01"
//   },
//   {
//     id: "2",
//     title: "Design",
//     description: "Design and architecture",
//     status: "current",
//     date: "2024-02-01"
//   },
//   {
//     id: "3",
//     title: "Development",
//     description: "Implementation phase",
//     status: "upcoming",
//     date: "2024-03-01"
//   }
// ];
// <ProgressTimeline steps={steps} orientation="vertical" />