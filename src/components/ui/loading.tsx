import * as React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "skeleton" | "dots";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({
  variant = "spinner",
  size = "md",
  text,
  className,
  ...props
}: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "animate-pulse rounded-full bg-muted-foreground",
              size === "sm" && "h-1 w-1",
              size === "md" && "h-1.5 w-1.5",
              size === "lg" && "h-2 w-2"
            )}
            style={{
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
        {text && (
          <span className="ml-2 text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizes[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
}