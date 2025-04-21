import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartProps {
  type: "line" | "bar" | "pie" | "area";
  data: ChartData[];
  title?: string;
  height?: number;
  width?: string;
  colors?: string[];
  isLoading?: boolean;
  className?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  onClick?: (data: ChartData) => void;
}

const defaultColors = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
];

export function Charts({
  type,
  data,
  title,
  height = 300,
  width = "100%",
  colors = defaultColors,
  isLoading = false,
  className,
  xAxisKey = "name",
  yAxisKey = "value",
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  onClick,
}: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width={width} height={height}>
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width={width} height={height}>
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              <Bar
                dataKey={yAxisKey}
                fill={colors[0]}
                onClick={(data) => onClick?.(data)}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width={width} height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={yAxisKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                onClick={(data) => onClick?.(data)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width={width} height={height}>
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey={yAxisKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full items-center justify-center"
          >
            <Loading size="lg" text="Loading chart data..." />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {title && (
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            )}
            {renderChart()}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Usage example:
// const data = [
//   { name: 'Jan', value: 400 },
//   { name: 'Feb', value: 300 },
//   { name: 'Mar', value: 600 },
//   { name: 'Apr', value: 800 },
// ];
// <Charts
//   type="line"
//   data={data}
//   title="Monthly Progress"
//   showGrid
//   showLegend
//   onClick={(data) => console.log(data)}
// />