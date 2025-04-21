
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BudgetData {
  name: string;
  value: number;
  color: string;
}

interface BudgetDonutChartProps {
  data: BudgetData[];
  title: string;
  total: number;
}

const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({ data, title, total }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={true} // Enable animation
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const percent = props.payload && props.payload.value && props.payload.value > 0 && props.payload.value <= props.payload.total
                  ? ((props.payload.value / props.payload.total) * 100).toFixed(1)
                  : '0';
                return [`${formatCurrency(value)} (${percent}%)`, name];
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BudgetDonutChart;
