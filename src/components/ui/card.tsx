import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isLoading?: boolean;
    isHoverable?: boolean;
  }
>(({ className, isLoading, isHoverable, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow transition-all duration-200",
      isHoverable && "hover:shadow-lg hover:-translate-y-0.5",
      isLoading && "animate-pulse",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 p-6 pt-0", className)}
    {...props}
  />
));
CardActions.displayName = "CardActions";

// Extend HTMLAttributes to accept standard div props like onClick
interface ReusableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardTitle: React.ReactNode; // Renamed from title to avoid conflict
  description?: React.ReactNode;
  cardContent: React.ReactNode; // Renamed from content to avoid conflict
  media?: React.ReactNode; // Add optional media prop
  footer?: React.ReactNode;
  // className is already part of HTMLAttributes
  isLoading?: boolean;
}

import { Skeleton } from "@/components/ui/skeleton";
const ReusableCard: React.FC<ReusableCardProps> = ({
  cardTitle, // Use renamed prop
  description,
  cardContent, // Use renamed prop
  media, // Destructure media prop
  footer,
  className,
  isLoading = false,
  ...props // Collect remaining props (like onClick)
}) => {
  return (
    <Card className={className} {...props}> {/* Spread the collected props here */}
      {media && <div className="overflow-hidden">{media}</div>} {/* Render media if provided */}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{cardTitle}</CardTitle> {/* Use renamed prop */}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-4 w-full" /> : cardContent} {/* Use renamed prop */}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardActions, ReusableCard }
