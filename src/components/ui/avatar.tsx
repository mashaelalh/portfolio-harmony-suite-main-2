import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  presence?: "online" | "idle" | "offline";
  showPresence?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, presence, showPresence = false, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const presenceClasses = {
    online: "bg-success",
    idle: "bg-warning",
    offline: "bg-muted"
  }

  return (
    <div className="relative">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full transition-shadow hover:shadow-md",
          sizeClasses[size],
          className
        )}
        {...props}
      />
      {showPresence && presence && (
        <span
          className={cn(
            "absolute bottom-0 right-0 ring-2 ring-background rounded-full",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3",
            size === "xl" && "h-3.5 w-3.5",
            presenceClasses[presence]
          )}
        />
      )}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    max?: number;
  }
>(({ className, max = 3, children, ...props }, ref) => {
  const childArray = React.Children.toArray(children);
  const excess = childArray.length - max;

  return (
    <div
      ref={ref}
      className={cn("flex -space-x-4", className)}
      {...props}
    >
      {childArray.slice(0, max).map((child, index) => (
        <div key={index} className="relative">
          {child}
        </div>
      ))}
      {excess > 0 && (
        <div
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium"
          )}
        >
          +{excess}
        </div>
      )}
    </div>
  )
})
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup }
