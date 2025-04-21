import React from 'react';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useProjects } from '@/hooks/useProjects';
import { usePortfolios } from '@/hooks/usePortfolios';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/dashboard/StatCard';
import StatusBarChart from '@/components/dashboard/StatusBarChart';
import BudgetDonutChart from '@/components/dashboard/BudgetDonutChart';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import ProjectCard from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Briefcase, Landmark, Plus, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: projects = [] } = useProjects();
  const { data: portfolios = [] } = usePortfolios();
  const tour = useOnboardingTour();
  
  // Calculate stats
  const totalBudget = React.useMemo(
    () => projects.reduce((sum, project) => sum + project.budget, 0),
    [projects]
  );
  const totalSpent = React.useMemo(
    () => projects.reduce((sum, project) => sum + project.actualCost, 0),
    [projects]
  );
  const budgetRemaining = totalBudget - totalSpent;

  const risksCount = React.useMemo(
    () => projects.reduce((sum, project) => sum + project.risks.length, 0),
    [projects]
  );
  const highRisksCount = React.useMemo(
    () =>
      projects.reduce(
        (sum, project) =>
          sum + project.risks.filter((r) => r.impact === 'high' && r.status === 'open').length,
        0
      ),
    [projects]
  );
  
  const projectStatusData = [
    {
      name: 'Corporate Initiatives',
      onTrack: 2,
      atRisk: 1,
      delayed: 0,
    },
    {
      name: 'Sports Projects',
      onTrack: 3,
      atRisk: 1,
      delayed: 1,
    },
    {
      name: 'Corporate Assets',
      onTrack: 1,
      atRisk: 1,
      delayed: 1,
    },
  ];
  
  const budgetData = [
    { name: 'Spent', value: totalSpent, color: 'hsl(var(--primary))' },
    { name: 'Remaining', value: budgetRemaining, color: 'hsl(var(--muted))' },
  ];

  return (
    <MainLayout title="Dashboard">
      <Button
        onClick={() => tour.start()}
        variant="default"
        className="fixed bottom-4 right-4 z-50 p-2 rounded-full shadow-lg"
        aria-label="Help and onboarding tour"
      >
        ?
      </Button>
      <div className="grid gap-6" role="main" aria-label="Dashboard main content">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key performance indicators">
          <StatCard
            title="Total Portfolios"
            value={portfolios.length}
            icon={<Briefcase className="h-4 w-4 text-primary" />}
            trend={{ value: 20, positive: true }}
          />
          <StatCard
            title="Active Projects"
            value={projects.filter(p => p.status === 'in_progress').length}
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            trend={{ value: 5, positive: true }}
          />
          <StatCard
            title="Budget Utilization"
            value={`${Math.round((totalSpent / totalBudget) * 100)}%`}
            description={`$${(totalSpent / 1000000).toFixed(1)}M of $${(totalBudget / 1000000).toFixed(1)}M`}
            icon={<Landmark className="h-4 w-4 text-primary" />}
            trend={{ value: 10, positive: false }}
          />
          <StatCard
            title="High Risk Projects"
            value={projects.filter(p => p.risks.some(r => r.impact === 'high' && r.status === 'open')).length}
            description={`${highRisksCount} high risks across all projects`}
            icon={<AlertTriangle className="h-4 w-4 text-primary" />}
            trend={{ value: 15, positive: false }}
          />
        </section>
        
        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Project status and budget charts">
          <StatusBarChart
            data={projectStatusData}
            title="Project Status by Portfolio"
          />
          <BudgetDonutChart
            data={budgetData}
            title="Budget Allocation"
            total={totalBudget}
          />
        </section>
        
        {/* Portfolios Section */}
        <section aria-label="Portfolios overview">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Portfolios</h2>
            <Button asChild>
              <Link to="/portfolios/new">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Portfolio</span>
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.slice(0, 3).map(portfolio => (
              <PortfolioCard key={portfolio.id} portfolio={portfolio} />
            ))}
            {portfolios.length > 3 && (
              <Button asChild variant="outline" className="col-span-1 md:col-span-2 lg:col-span-3 h-14">
                <Link to="/portfolios">View All Portfolios</Link>
              </Button>
            )}
          </div>
        </section>
        
        {/* Projects Section */}
        <section aria-label="Recent projects overview">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button asChild>
              <Link to="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Project</span>
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.slice(0, 4).map(project => (
              <ProjectCard 
                key={project.id} 
                project={{
                  ...project,
                  documents: [] // Add empty documents array
                }} 
              />
            ))}
            {projects.length > 4 && (
              <Button asChild variant="outline" className="col-span-1 lg:col-span-2 h-14">
                <Link to="/projects">View All Projects</Link>
              </Button>
            )}
          </div>
        </section>
        
        {/* Upcoming Milestones */}
        <section aria-label="Upcoming project milestones">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Milestones</h2>
            <Button variant="outline" asChild>
              <Link to="/milestones">
                <Calendar className="h-4 w-4 mr-2" />
                <span>View Calendar</span>
              </Link>
            </Button>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="space-y-4">
              {projects
                .flatMap(project =>
                  project.milestones
                    .filter(m => m.status !== 'completed')
                    .map(milestone => ({
                      ...milestone,
                      projectName: project.name,
                      projectId: project.id
                    }))
                )
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5)
                .map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h3 className="font-medium">{milestone.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Project: <Link to={`/projects/${milestone.projectId}`} className="text-primary hover:underline">
                          {milestone.projectName}
                        </Link>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(milestone.dueDate).toLocaleDateString()}</p>
                      <Badge
                        className={
                          milestone.status === 'delayed' ? 'bg-risk-high' :
                          milestone.status === 'in_progress' ? 'bg-amber-500' :
                          'bg-muted text-muted-foreground'
                        }
                      >
                        {milestone.status === 'delayed' ? 'Delayed' :
                         milestone.status === 'in_progress' ? 'In Progress' :
                         'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))
              }
              {projects.flatMap(p => p.milestones).filter(m => m.status !== 'completed').length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No upcoming milestones
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
