import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Risk {
  id: string;
  title: string;
  description?: string;
  impact: 1 | 2 | 3 | 4 | 5; // 1 = Very Low, 5 = Very High
  probability: 1 | 2 | 3 | 4 | 5; // 1 = Very Low, 5 = Very High
  category?: string;
  owner?: string;
}

interface RiskMatrixProps {
  risks: Risk[];
  onRiskClick?: (risk: Risk) => void;
  className?: string;
}

const impactLabels = ["Very Low", "Low", "Medium", "High", "Very High"];
const probabilityLabels = ["Very Low", "Low", "Medium", "High", "Very High"];

const getCellColor = (impact: number, probability: number): string => {
  const severity = impact * probability;
  
  if (severity <= 4) return "bg-success/10 hover:bg-success/20"; // Low
  if (severity <= 9) return "bg-warning/10 hover:bg-warning/20"; // Medium
  if (severity <= 16) return "bg-orange-500/10 hover:bg-orange-500/20"; // High
  return "bg-destructive/10 hover:bg-destructive/20"; // Critical
};

const getRiskSeverity = (impact: number, probability: number): string => {
  const severity = impact * probability;
  
  if (severity <= 4) return "Low";
  if (severity <= 9) return "Medium";
  if (severity <= 16) return "High";
  return "Critical";
};

export function RiskMatrix({ risks, onRiskClick, className }: RiskMatrixProps) {
  const [selectedCell, setSelectedCell] = React.useState<string | null>(null);

  const matrix = Array.from({ length: 5 }, (_, i) => 
    Array.from({ length: 5 }, (_, j) => {
      const impact = 5 - i;
      const probability = j + 1;
      const cellRisks = risks.filter(
        (risk) => risk.impact === impact && risk.probability === probability
      );
      return {
        impact,
        probability,
        risks: cellRisks,
      };
    })
  );

  return (
    <TooltipProvider>
      <Card className={cn("p-6", className)}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Risk Matrix</h3>
          
          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 transform text-sm font-medium text-muted-foreground">
              Impact
            </div>
            
            {/* Matrix Grid */}
            <div className="grid grid-cols-5 gap-1">
              {matrix.map((row, i) =>
                row.map((cell, j) => (
                  <Tooltip key={`${i}-${j}`}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={cn(
                          "relative aspect-square cursor-pointer rounded-md p-2 transition-colors",
                          getCellColor(cell.impact, cell.probability),
                          selectedCell === `${i}-${j}` && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedCell(`${i}-${j}`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cell.risks.length > 0 && (
                          <AnimatePresence>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium shadow-sm">
                                {cell.risks.length}
                              </span>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <div className="font-medium">
                          Impact: {impactLabels[cell.impact - 1]}
                          <br />
                          Probability: {probabilityLabels[cell.probability - 1]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Severity: {getRiskSeverity(cell.impact, cell.probability)}
                        </div>
                        {cell.risks.length > 0 && (
                          <div className="pt-2 text-sm">
                            <div className="font-medium">Risks:</div>
                            <ul className="list-inside list-disc">
                              {cell.risks.map((risk) => (
                                <li
                                  key={risk.id}
                                  className="cursor-pointer text-primary hover:underline"
                                  onClick={() => onRiskClick?.(risk)}
                                >
                                  {risk.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))
              )}
            </div>

            {/* X-axis label */}
            <div className="mt-2 text-center text-sm font-medium text-muted-foreground">
              Probability
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-success/10" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-warning/10" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-orange-500/10" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-destructive/10" />
              <span>Critical</span>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}

// Usage example:
// const risks = [
//   {
//     id: "1",
//     title: "Budget Overrun",
//     description: "Project costs exceeding initial estimates",
//     impact: 4,
//     probability: 3,
//     category: "Financial",
//     owner: "John Doe"
//   },
//   {
//     id: "2",
//     title: "Technical Debt",
//     description: "Accumulation of technical compromises",
//     impact: 3,
//     probability: 4,
//     category: "Technical",
//     owner: "Jane Smith"
//   }
// ];
// <RiskMatrix
//   risks={risks}
//   onRiskClick={(risk) => console.log("Clicked risk:", risk)}
// />