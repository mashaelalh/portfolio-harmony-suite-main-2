
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatusChartData {
  name: string;
  onTrack: number;
  atRisk: number;
  delayed: number;
}

interface StatusBarChartProps {
  data: StatusChartData[];
  title: string;
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data, title }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))', // Use CSS variable for background
                color: 'hsl(var(--foreground))', // Use CSS variable for text
                borderRadius: 'var(--radius)', // Use CSS variable for radius
                boxShadow: 'var(--shadow-md)', // Use theme shadow if available, or keep existing
                border: '1px solid hsl(var(--border))', // Use CSS variable for border
              }}
              formatter={(value: number, name: string, props: any) => {
                const total = props.payload.onTrack + props.payload.atRisk + props.payload.delayed;
                const percent = total ? ((value / total) * 100).toFixed(1) : '0';
                return [`${value} (${percent}%)`, name];
              }}
            />
            <Legend />
            <Bar 
              dataKey="onTrack" 
              name="On Track" 
              stackId="a" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} // Keep radius for individual bars
              isAnimationActive={true} // Enable animation
            />
            <Bar 
              dataKey="atRisk" 
              name="At Risk" 
              stackId="a" 
              fill="#F97316" 
              radius={[4, 4, 0, 0]}
              isAnimationActive={true} // Enable animation
            />
            <Bar 
              dataKey="delayed" 
              name="Delayed" 
              stackId="a" 
              fill="#F43F5E" 
              radius={[4, 4, 0, 0]}
              isAnimationActive={true} // Enable animation
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatusBarChart;
