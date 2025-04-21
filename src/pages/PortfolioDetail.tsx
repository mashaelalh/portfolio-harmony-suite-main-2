import React, { useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useProjects } from '@/hooks/useProjects';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Calendar, Plus, FileText, Users, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import ProjectCard from '@/components/project/ProjectCard';
import { Skeleton } from "@/components/ui/skeleton";
import { ReusableCard } from '@/components/ui/card';
import { Project } from '@/lib/store/projectStore';
import { Portfolio } from '@/lib/store/portfolioStore';
import { saveAs } from 'file-saver';
// Ensure the correct path to the Timeline component
import Timeline from '../components/ui/timeline';
import Heatmap from '../components/ui/heatmap';
import { Separator } from '@/components/ui/separator';

const LazyProjectsTab = React.lazy(() => import('@/components/tabs/ProjectsTab'));
const LazyTeamTab = React.lazy(() => import('@/components/tabs/TeamTab'));
const LazyReportsTab = React.lazy(() => import('@/components/tabs/ReportsTab'));

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: portfolios = [], isLoading: isLoadingPortfolios, error: portfoliosError } = usePortfolios();
  const { data: allProjects = [], isLoading: isLoadingProjects, error: projectsError } = useProjects();
  
  // Check for errors
  if (portfoliosError || projectsError) {
    return (
      <MainLayout title="Error Loading Portfolio">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold">Error Loading Data</h2>
          <p className="text-muted-foreground">
            {portfoliosError?.message || projectsError?.message || "An unexpected error occurred."}
          </p>
          <Button asChild>
            <Link to="/portfolios">Back to Portfolios</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Define types for portfolio and portfolioProjects
  const portfolio: Portfolio | undefined = portfolios.find(p => p.id === id);
  const portfolioProjects: Project[] = allProjects.filter(project => project.portfolioId === id);
  
  const calculatePortfolioStats = (portfolioProjects) => {
    const totalBudget = portfolioProjects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = portfolioProjects.reduce((sum, project) => sum + project.actualCost, 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const activeProjects = portfolioProjects.filter(p => p.status === 'in_progress').length;
    const completedProjects = portfolioProjects.filter(p => p.status === 'completed').length;
    const highRiskProjects = portfolioProjects.filter(p => p.risks.some(r => r.impact === 'high' && r.status === 'open')).length;
  
    return { totalBudget, totalSpent, budgetUtilization, activeProjects, completedProjects, highRiskProjects };
  };
  
  const { totalBudget, totalSpent, budgetUtilization, activeProjects, completedProjects, highRiskProjects } = calculatePortfolioStats(portfolioProjects);
  
  const isLoading = isLoadingPortfolios || isLoadingProjects;
  
  if (isLoading) {
    return (
      <MainLayout title="Loading Portfolio...">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Separator/>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!portfolio) {
    return (
      <MainLayout title="Portfolio Not Found">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold">Portfolio Not Found</h2>
          <p className="text-muted-foreground">The portfolio you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/portfolios">Back to Portfolios</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sports':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sports</Badge>;
      case 'assets':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Assets</Badge>;
      case 'corporate':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Corporate</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  const exportPortfolioData = (portfolio, portfolioProjects) => {
    const data = [
      { key: 'Portfolio Name', value: portfolio.name },
      { key: 'Description', value: portfolio.description },
      { key: 'Total Budget', value: `$${(portfolioProjects.reduce((sum, p) => sum + p.budget, 0) / 1000).toFixed(0)}k` },
      { key: 'Total Spent', value: `$${(portfolioProjects.reduce((sum, p) => sum + p.actualCost, 0) / 1000).toFixed(0)}k` },
      { key: 'High Risk Projects', value: portfolioProjects.filter(p => p.risks.some(r => r.impact === 'high')).length },
    ];
  
    const csvContent = data.map(row => `${row.key},${row.value}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${portfolio.name}_details.csv`);
  };
  
  return (
    <MainLayout title={portfolio.name}>
      <div className="space-y-6">
        {/* Portfolio Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">{portfolio.name}</h1>
              {getTypeIcon(portfolio.type)}
            </div>
            <p className="text-muted-foreground text-sm">{portfolio.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Add a new project">
              <Link to="/projects/new">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>Add Project</span>
              </Link>
            </Button>
            <Button onClick={() => exportPortfolioData(portfolio, portfolioProjects)} aria-label="Export Portfolio Data">
              Export Data
            </Button>
          </div>
        </div>
        
        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReusableCard
            title="Projects"
            content={
              <>
                <div className="text-2xl font-bold">{portfolioProjects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeProjects} active, {completedProjects} completed
                </p>
              </>
            }
          />
          
          <ReusableCard
            title="Budget"
            content={
              <>
                <div className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}k</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(totalSpent / 1000).toFixed(0)}k spent ({budgetUtilization}%)
                </p>
              </>
            }
          />
          
          <ReusableCard
            title="Last Updated"
            content={
              <>
                <div className="text-2xl font-bold">{format(new Date(portfolio.updatedAt), 'MMM d')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(portfolio.updatedAt), 'yyyy')}
                </p>
              </>
            }
          />
          
          <ReusableCard
            title="High Risk Projects"
            content={
              <>
                <div className="text-2xl font-bold">{highRiskProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {highRiskProjects > 0 ? 'Needs attention' : 'No high risks'}
                </p>
              </>
            }
          />
        </div>
        
        {/* Portfolio Content */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">
              <FileText className="h-4 w-4 mr-2" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <LazyProjectsTab portfolioProjects={portfolioProjects} />
            </Suspense>
          </TabsContent>

          {/* Placeholder for future Team Management features */}
          <TabsContent value="team" className="space-y-4">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              {/* Future enhancements: Add team member management, role assignments, and collaboration tools */}
              <LazyTeamTab />
            </Suspense>
          </TabsContent>

          {/* Placeholder for future Reports & Analytics features */}
          <TabsContent value="reports" className="space-y-4">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              {/* Future enhancements: Add detailed analytics, export options, and visualization tools */}
              <LazyReportsTab />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Portfolio Timeline */}
        <Timeline events={portfolio.events} />

        {/* Risk Heatmap */}
        <Heatmap data={portfolioProjects.map(p => ({ name: p.name, risks: p.risks }))} />
      </div>
    </MainLayout>
  );
};

export default PortfolioDetail;