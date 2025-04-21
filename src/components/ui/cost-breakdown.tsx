import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

interface CostItem {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  children?: CostItem[];
  status?: "under" | "on-track" | "over";
}

interface CostBreakdownProps {
  data: CostItem[];
  currency?: string;
  className?: string;
  onItemClick?: (item: CostItem) => void;
}

const formatCurrency = (amount: number, currency = "SAR"): string => {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getVariancePercentage = (budgeted: number, actual: number): number => {
  return ((actual - budgeted) / budgeted) * 100;
};

const getStatusColor = (status: CostItem["status"]): string => {
  switch (status) {
    case "under":
      return "text-success";
    case "over":
      return "text-destructive";
    default:
      return "text-primary";
  }
};

const CostItemRow = ({
  item,
  level = 0,
  currency,
  onItemClick,
}: {
  item: CostItem;
  level?: number;
  currency?: string;
  onItemClick?: (item: CostItem) => void;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const variance = getVariancePercentage(item.budgeted, item.actual);
  const progress = (item.actual / item.budgeted) * 100;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="group"
      >
        <div
          className={cn(
            "grid grid-cols-12 items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50",
            hasChildren && "cursor-pointer"
          )}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => {
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            }
            onItemClick?.(item);
          }}
        >
          <div className="col-span-4 flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <span className="font-medium">{item.name}</span>
          </div>
          <div className="col-span-2 text-right font-mono">
            {formatCurrency(item.budgeted, currency)}
          </div>
          <div className="col-span-2 text-right font-mono">
            {formatCurrency(item.actual, currency)}
          </div>
          <div className="col-span-2">
            <Progress
              value={progress}
              className={cn(
                progress > 100 && "bg-destructive/20",
                progress < 90 && "bg-success/20"
              )}
              indicatorClassName={cn(
                progress > 100 && "bg-destructive",
                progress < 90 && "bg-success"
              )}
            />
          </div>
          <div
            className={cn(
              "col-span-2 text-right font-mono",
              variance > 0 && "text-destructive",
              variance < 0 && "text-success"
            )}
          >
            {variance > 0 ? "+" : ""}
            {variance.toFixed(1)}%
            {Math.abs(variance) > 10 && (
              <AlertTriangle className="ml-2 inline-block h-4 w-4" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {item.children?.map((child) => (
              <CostItemRow
                key={child.id}
                item={child}
                level={level + 1}
                currency={currency}
                onItemClick={onItemClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export function CostBreakdown({
  data,
  currency = "SAR",
  className,
  onItemClick,
}: CostBreakdownProps) {
  const totalBudgeted = data.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalVariance = getVariancePercentage(totalBudgeted, totalActual);

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cost Breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Total Budget: {formatCurrency(totalBudgeted, currency)}
            </div>
            <div
              className={cn(
                "text-sm font-medium",
                totalVariance > 0 && "text-destructive",
                totalVariance < 0 && "text-success"
              )}
            >
              Variance: {totalVariance > 0 ? "+" : ""}
              {totalVariance.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Category</div>
          <div className="col-span-2 text-right">Budgeted</div>
          <div className="col-span-2 text-right">Actual</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-2 text-right">Variance</div>
        </div>

        {/* Cost Items */}
        <div className="space-y-1">
          {data.map((item) => (
            <CostItemRow
              key={item.id}
              item={item}
              currency={currency}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// Usage example:
// const costData = [
//   {
//     id: "1",
//     name: "Development",
//     budgeted: 500000,
//     actual: 450000,
//     children: [
//       {
//         id: "1.1",
//         name: "Frontend",
//         budgeted: 200000,
//         actual: 180000,
//       },
//       {
//         id: "1.2",
//         name: "Backend",
//         budgeted: 300000,
//         actual: 270000,
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "Marketing",
//     budgeted: 300000,
//     actual: 350000,
//     status: "over",
//   },
// ];
// <CostBreakdown
//   data={costData}
//   currency="SAR"
//   onItemClick={(item) => console.log("Clicked:", item)}
// />