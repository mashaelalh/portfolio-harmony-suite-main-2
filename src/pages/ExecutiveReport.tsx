
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { useProjectStore } from '@/lib/store/projectStore';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { cn } from '@/lib/utils';

const ExecutiveReport: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  
  useEffect(() => {
    fetchProjects();
    fetchPortfolios();
  }, [fetchProjects, fetchPortfolios]);
  
  // Calculate key metrics
  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.actualCost, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace('_', ' '),
    count
  }));
  
  const portfolioData = portfolios.map(portfolio => ({
    name: portfolio.name,
    projectCount: projects.filter(p => p.portfolioId === portfolio.id).length,
    budget: projects
      .filter(p => p.portfolioId === portfolio.id)
      .reduce((sum, p) => sum + p.budget, 0),
    spent: projects
      .filter(p => p.portfolioId === portfolio.id)
      .reduce((sum, p) => sum + p.actualCost, 0)
  }));
  
  const riskData = projects.flatMap(p => p.risks).reduce((acc, risk) => {
    acc[risk.impact] = (acc[risk.impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const riskStatusData = projects.flatMap(p => p.risks).reduce((acc, risk) => {
    acc[risk.status] = (acc[risk.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const riskPieData = [
    { name: 'High', value: riskData.high || 0, color: '#ef4444' },
    { name: 'Medium', value: riskData.medium || 0, color: '#f59e0b' },
    { name: 'Low', value: riskData.low || 0, color: '#10b981' }
  ];
  
  const riskStatusPieData = [
    { name: 'Open', value: riskStatusData.open || 0, color: '#ef4444' },
    { name: 'Mitigated', value: riskStatusData.mitigated || 0, color: '#f59e0b' },
    { name: 'Closed', value: riskStatusData.closed || 0, color: '#10b981' }
  ];
  
  // Budget trends (fabricated for demonstration)
  const periodData = [
    { month: 'Jan', planned: 200000, actual: 210000 },
    { month: 'Feb', planned: 400000, actual: 390000 },
    { month: 'Mar', planned: 600000, actual: 620000 },
    { month: 'Apr', planned: 800000, actual: 850000 },
    { month: 'May', planned: 1000000, actual: 1100000 },
    { month: 'Jun', planned: 1200000, actual: 1350000 }
  ];

  // Strategic Objective Distribution
  const strategicObjectiveData = projects.reduce((acc, project) => {
    if (project.strategicObjective) {
      acc[project.strategicObjective] = (acc[project.strategicObjective] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const strategicObjectiveChartData = Object.entries(strategicObjectiveData).map(([objective, count]) => ({
    name: objective
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    count,
    color: objective === 'digital_transformation' ? '#3b82f6' :
           objective === 'operational_excellence' ? '#10b981' :
           objective === 'customer_experience' ? '#f59e0b' :
           objective === 'innovation' ? '#6366f1' :
           '#ef4444'
  }));

  // Corporate KPIs Analysis
  const corporateKPIsData = projects.reduce((acc, project) => {
    project.corporateKPIs?.forEach(kpi => {
      acc[kpi] = (acc[kpi] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const corporateKPIsChartData = Object.entries(corporateKPIsData)
    .map(([kpi, count]) => ({ name: kpi, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 KPIs

  return (
    <AuthGuard>
      <MainLayout title="Executive Report">
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <div className="flex mt-2">
                  {statusData.map((status, index) => (
                    <div 
                      key={index} 
                      className="h-1.5 first:rounded-l-full last:rounded-r-full" 
                      style={{ 
                        width: `${(status.count / totalProjects) * 100}%`,
                        backgroundColor: status.name === 'completed' ? '#10b981' : 
                                        status.name === 'in progress' ? '#3b82f6' : 
                                        status.name === 'on hold' ? '#f59e0b' : 
                                        status.name === 'not started' ? '#6b7280' : '#ef4444'
                      }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalBudget / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Across all active projects
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Actual Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalSpent / 1000000).toFixed(2)}M</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {budgetUtilization.toFixed(1)}% of total budget
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.flatMap(p => p.risks).filter(r => r.status === 'open').length}
                </div>
                <div className="flex mt-1">
                  <Badge className="mr-1 bg-risk-high">
                    {projects.flatMap(p => p.risks).filter(r => r.status === 'open' && r.impact === 'high').length} High
                  </Badge>
                  <Badge className="mr-1 bg-risk-medium">
                    {projects.flatMap(p => p.risks).filter(r => r.status === 'open' && r.impact === 'medium').length} Medium
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="budgets">Budgets</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
              <TabsTrigger value="strategic">Strategic Alignment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Projects" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Budget vs. Actual by Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={portfolioData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${(value as number / 1000000).toFixed(2)}M`} />
                          <Legend />
                          <Bar dataKey="budget" name="Budget" fill="#3b82f6" />
                          <Bar dataKey="spent" name="Actual Spend" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Budget Trend over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={periodData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${(value as number / 1000).toFixed(0)}k`} />
                          <Legend />
                          <Line type="monotone" dataKey="planned" name="Planned Spend" stroke="#3b82f6" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="actual" name="Actual Spend" stroke="#ef4444" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="budgets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Budget Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Budget Utilization</span>
                          <span className={cn(
                            "font-medium",
                            budgetUtilization > 90 ? "text-risk-high" : 
                            budgetUtilization > 75 ? "text-amber-500" : ""
                          )}>
                            {budgetUtilization.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={budgetUtilization} 
                          className={cn(
                            "h-2",
                            budgetUtilization > 90 ? "text-risk-high" : 
                            budgetUtilization > 75 ? "text-amber-500" : ""
                          )} 
                        />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-4">Budget Details</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground">Total Budget</div>
                            <div className="text-lg font-bold">${(totalBudget / 1000000).toFixed(2)}M</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Total Spent</div>
                            <div className="text-lg font-bold">${(totalSpent / 1000000).toFixed(2)}M</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Remaining</div>
                            <div className="text-lg font-bold">${((totalBudget - totalSpent) / 1000000).toFixed(2)}M</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Forecast Variance</div>
                            <div className="text-lg font-bold text-amber-500">+2.1%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Budget by Project Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projects.reduce((acc, project) => {
                              const existingIndex = acc.findIndex(item => item.name === project.status);
                              if (existingIndex >= 0) {
                                acc[existingIndex].value += project.budget;
                              } else {
                                acc.push({
                                  name: project.status,
                                  value: project.budget,
                                  color: project.status === 'completed' ? '#10b981' : 
                                          project.status === 'in_progress' ? '#3b82f6' : 
                                          project.status === 'on_hold' ? '#f59e0b' : 
                                          project.status === 'not_started' ? '#6b7280' : '#ef4444'
                                });
                              }
                              return acc;
                            }, [] as {name: string; value: number; color: string}[])}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {projects.reduce((acc, project) => {
                              const existingIndex = acc.findIndex(item => item.name === project.status);
                              if (existingIndex === -1) {
                                acc.push({
                                  name: project.status,
                                  value: project.budget,
                                  color: project.status === 'completed' ? '#10b981' : 
                                          project.status === 'in_progress' ? '#3b82f6' : 
                                          project.status === 'on_hold' ? '#f59e0b' : 
                                          project.status === 'not_started' ? '#6b7280' : '#ef4444'
                                });
                              }
                              return acc;
                            }, [] as {name: string; value: number; color: string}[]).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${(value as number / 1000000).toFixed(2)}M`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Projects by Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-medium">Project</th>
                            <th className="text-left py-3 font-medium">Portfolio</th>
                            <th className="text-right py-3 font-medium">Budget</th>
                            <th className="text-right py-3 font-medium">Spent</th>
                            <th className="text-right py-3 font-medium">% Used</th>
                            <th className="text-right py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects
                            .sort((a, b) => b.budget - a.budget)
                            .slice(0, 5)
                            .map(project => {
                              const portfolio = portfolios.find(p => p.id === project.portfolioId);
                              const percentUsed = (project.actualCost / project.budget) * 100;
                              
                              return (
                                <tr key={project.id} className="border-b hover:bg-muted/30">
                                  <td className="py-3 font-medium">{project.name}</td>
                                  <td className="py-3">{portfolio?.name || 'Unknown'}</td>
                                  <td className="py-3 text-right">${(project.budget / 1000000).toFixed(2)}M</td>
                                  <td className="py-3 text-right">${(project.actualCost / 1000000).toFixed(2)}M</td>
                                  <td className="py-3 text-right">
                                    <span className={cn(
                                      percentUsed > 90 ? "text-risk-high" : 
                                      percentUsed > 75 ? "text-amber-500" : ""
                                    )}>
                                      {percentUsed.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <Badge className={cn(
                                      project.status === 'completed' ? "bg-risk-low" : 
                                      project.status === 'in_progress' ? "bg-blue-500" : 
                                      project.status === 'on_hold' ? "bg-amber-500" : 
                                      project.status === 'cancelled' ? "bg-risk-high" : 
                                      "bg-muted"
                                    )}>
                                      {project.status.replace('_', ' ')}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="risks" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Impact Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {riskPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskStatusPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {riskStatusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>High Impact Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-medium">Project</th>
                            <th className="text-left py-3 font-medium">Risk Description</th>
                            <th className="text-left py-3 font-medium">Impact</th>
                            <th className="text-left py-3 font-medium">Status</th>
                            <th className="text-left py-3 font-medium">Mitigation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.flatMap(project => 
                            project.risks
                              .filter(risk => risk.impact === 'high')
                              .map(risk => ({
                                projectName: project.name,
                                projectId: project.id,
                                ...risk
                              }))
                          ).map(risk => (
                            <tr key={risk.id} className="border-b hover:bg-muted/30">
                              <td className="py-3 font-medium">{risk.projectName}</td>
                              <td className="py-3">{risk.description}</td>
                              <td className="py-3">
                                <Badge className="bg-risk-high">
                                  High
                                </Badge>
                              </td>
                              <td className="py-3">
                                <Badge variant="outline" className={cn(
                                  risk.status === 'open' ? "border-risk-high bg-risk-high/10 text-risk-high" : 
                                  risk.status === 'mitigated' ? "border-amber-500 bg-amber-500/10 text-amber-500" : 
                                  "border-risk-low bg-risk-low/10 text-risk-low"
                                )}>
                                  {risk.status}
                                </Badge>
                              </td>
                              <td className="py-3">{risk.mitigation || 'No mitigation plan'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="portfolios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map(portfolio => {
                  const portfolioProjects = projects.filter(p => p.portfolioId === portfolio.id);
                  const totalBudget = portfolioProjects.reduce((sum, p) => sum + p.budget, 0);
                  const totalSpent = portfolioProjects.reduce((sum, p) => sum + p.actualCost, 0);
                  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                  
                  const statusCounts = portfolioProjects.reduce((acc, project) => {
                    acc[project.status] = (acc[project.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  return (
                    <Card key={portfolio.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                          <Badge className="capitalize">{portfolio.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Projects</span>
                              <span>{portfolioProjects.length}</span>
                            </div>
                            <div className="flex h-1.5">
                              {Object.entries(statusCounts).map(([status, count], index) => (
                                <div 
                                  key={index} 
                                  className="first:rounded-l-full last:rounded-r-full" 
                                  style={{ 
                                    width: portfolioProjects.length > 0 ? `${(count / portfolioProjects.length) * 100}%` : '0%',
                                    backgroundColor: status === 'completed' ? '#10b981' : 
                                                    status === 'in_progress' ? '#3b82f6' : 
                                                    status === 'on_hold' ? '#f59e0b' : 
                                                    status === 'not_started' ? '#6b7280' : '#ef4444'
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Utilization</span>
                              <span className={cn(
                                "font-medium",
                                percentUsed > 90 ? "text-risk-high" : 
                                percentUsed > 75 ? "text-amber-500" : ""
                              )}>
                                {percentUsed.toFixed(1)}%
                              </span>
                            </div>
                            <Progress 
                              value={percentUsed} 
                              className={cn(
                                "h-1.5",
                                percentUsed > 90 ? "text-risk-high" : 
                                percentUsed > 75 ? "text-amber-500" : ""
                              )} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div>
                              <div className="text-xs text-muted-foreground">Total Budget</div>
                              <div className="font-medium">${(totalBudget / 1000000).toFixed(2)}M</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Spent</div>
                              <div className="font-medium">${(totalSpent / 1000000).toFixed(2)}M</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Open Risks</div>
                              <div className="font-medium">
                                {portfolioProjects.flatMap(p => p.risks).filter(r => r.status === 'open').length}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">High Impact</div>
                              <div className="font-medium">
                                {portfolioProjects.flatMap(p => p.risks).filter(r => r.status === 'open' && r.impact === 'high').length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="strategic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Objectives Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={strategicObjectiveChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Projects" fill="#3b82f6">
                            {strategicObjectiveChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Corporate KPIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={corporateKPIsChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Projects" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Strategic Alignment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-medium">Project</th>
                            <th className="text-left py-3 font-medium">Strategic Objective</th>
                            <th className="text-left py-3 font-medium">Corporate KPIs</th>
                            <th className="text-left py-3 font-medium">Portfolio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects
                            .filter(project => project.strategicObjective)
                            .map(project => {
                              const portfolio = portfolios.find(p => p.id === project.portfolioId);
                              return (
                                <tr key={project.id} className="border-b hover:bg-muted/30">
                                  <td className="py-3 font-medium">{project.name}</td>
                                  <td className="py-3">
                                    <Badge variant="outline">
                                      {project.strategicObjective
                                        .split('_')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')}
                                    </Badge>
                                  </td>
                                  <td className="py-3">
                                    {project.corporateKPIs?.map((kpi, index) => (
                                      <Badge key={index} variant="secondary" className="mr-1">
                                        {kpi}
                                      </Badge>
                                    ))}
                                  </td>
                                  <td className="py-3">{portfolio?.name || 'Unassigned'}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default ExecutiveReport;
