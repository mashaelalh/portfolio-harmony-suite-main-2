import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
} from '@/components/ui/chart';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';

interface BudgetInsightsProps {
  totalBudget: number;
  actualSpend: number;
  forecastedSpend: number;
  contingencyBudget: number;
}

const BudgetInsights: React.FC<BudgetInsightsProps> = ({
  totalBudget,
  actualSpend,
  forecastedSpend,
  contingencyBudget
}) => {
  const budgetVariance = ((actualSpend + forecastedSpend - totalBudget) / totalBudget) * 100;
  const remainingBudget = totalBudget - (actualSpend + forecastedSpend);
  const spentPercentage = ((actualSpend + forecastedSpend) / totalBudget) * 100;

  const budgetData = [
    { name: 'Actual Spend', value: actualSpend, fill: 'hsl(var(--primary))' },
    { name: 'Forecasted Spend', value: forecastedSpend, fill: 'hsl(var(--secondary))' },
    { name: 'Remaining Budget', value: remainingBudget, fill: 'hsl(var(--muted))' },
    { name: 'Contingency', value: contingencyBudget, fill: 'hsl(var(--accent))' }
  ];

  const getVarianceStatus = () => {
    if (budgetVariance < -10) return { icon: <TrendingDown className="text-risk-low" />, text: 'Under Budget', color: 'text-risk-low' };
    if (budgetVariance > 10) return { icon: <AlertTriangle className="text-risk-high" />, text: 'Over Budget', color: 'text-risk-high' };
    return { icon: <TrendingUp className="text-primary" />, text: 'On Track', color: 'text-primary' };
  };

  const varianceStatus = getVarianceStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Insights
          </div>
          <div className={`flex items-center gap-2 ${varianceStatus.color}`}>
            {varianceStatus.icon}
            {varianceStatus.text}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Budget Utilization</span>
            <span>{spentPercentage.toFixed(2)}%</span>
          </div>
          <Progress value={spentPercentage} />
          
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Budget</p>
              <p className="font-semibold">${totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold">${remainingBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div>
          <ChartContainer
            config={{
              'Actual Spend': { label: 'Actual Spend' },
              'Forecasted Spend': { label: 'Forecasted Spend' },
              'Remaining Budget': { label: 'Remaining Budget' },
              'Contingency': { label: 'Contingency' }
            }}
            className="" // Removed fixed height h-[200px]
          >
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip />
                <Pie 
                  data={budgetData} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={60} 
                  outerRadius={80} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetInsights;
