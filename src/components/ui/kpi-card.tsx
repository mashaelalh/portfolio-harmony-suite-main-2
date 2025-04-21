import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Equal } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  prefix?: string;
  trend?: "up" | "down" | "neutral";
  trendPercentage?: number;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  previousValue,
  unit = "",
  prefix = "",
  trend,
  trendPercentage,
  isLoading = false,
  className,
  onClick,
}: KPICardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Equal;

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 transition-all hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-[120px]" />
          {trend && <Skeleton className="h-4 w-[80px]" />}
        </div>
      ) : (
        <>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-2 flex items-baseline text-3xl font-semibold"
            >
              {prefix && <span className="text-xl mr-1">{prefix}</span>}
              {formatNumber(value)}
              {unit && <span className="ml-1 text-lg">{unit}</span>}
            </motion.div>
          </AnimatePresence>
          {trend && trendPercentage && (
            <div className="mt-4 flex items-center gap-2">
              <TrendIcon className={cn("h-4 w-4", trendColor)} />
              <span className={cn("text-sm font-medium", trendColor)}>
                {trendPercentage}%
              </span>
              <span className="text-sm text-muted-foreground">vs previous</span>
            </div>
          )}
          {/* Background decoration */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-muted/10 to-transparent" />
        </>
      )}
    </Card>
  );
}

// Usage example:
// <KPICard
//   title="Total Projects"
//   value={1234}
//   previousValue={1000}
//   trend="up"
//   trendPercentage={23.4}
//   isLoading={false}
//   onClick={() => console.log('clicked')}
// />