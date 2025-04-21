import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useProjectStore } from '@/lib/store/projectStore';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import MilestoneTable from '@/components/project/MilestoneTable';
import RiskTable from '@/components/risk/RiskTable';
import GanttChart from '@/components/project/GanttChart';
import BudgetInsights from '@/components/project/BudgetInsights';
import StrategicAlignmentBox from '@/components/project/StrategicAlignmentBox';
import StageGateProgress from '@/components/project/StageGateProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GanttChartSquare, ListChecks, ShieldCheck, TrendingUp } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { toast } from '@/components/ui/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProjectDetailPageProps {}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();

  // Memoize the selector function to prevent unnecessary re-renders
  const storeSelector = useCallback((state) => ({
    selectedProject: state.selectedProject,
    isLoading: state.isLoading,
  }), []);

  // Use useMemo to cache the selection result
  const { selectedProject, isLoading } = useMemo(() =>
    useProjectStore.getState(),
    [],
  );

  // Stable reference for fetching functions
  const fetchFunctions = useMemo(() => ({
    fetchProjectById: useProjectStore.getState().fetchProjectById,
    fetchDocuments: useProjectStore.getState().fetchDocuments,
    fetchPortfolios: usePortfolioStore.getState().fetchPortfolios,
  }), []);

  useEffect(() => {
    if (!id) return;

    const loadProjectData = async () => {
      try {
        await fetchFunctions.fetchProjectById(id);
        await fetchFunctions.fetchDocuments(id);
        await fetchFunctions.fetchPortfolios();
      } catch (error) {
        console.error('Error loading project data:', error);
      }
    };

    loadProjectData();
  }, [id, fetchFunctions]);

  // Subscribe to store changes with stable selector
  useEffect(() => {
    let previousState: any | undefined = undefined; // Track previous state
    const unsubscribe = useProjectStore.subscribe(
      (state) => {
        const { selectedProject } = state;
        if (selectedProject?.id !== previousState?.selectedProject?.id) {
          toast({title: `Project changed: ${selectedProject?.name || 'Unknown project'}`});
        }
        previousState = state;
      }
    );

    return () => unsubscribe();
  }, [storeSelector]);

  if (isLoading) {
    return (
      <AuthGuard>
        <MainLayout title="Project Details">
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
                  <Separator />
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
              <Card className="mt-6">
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
      </AuthGuard>
    );
  }

  if (!selectedProject) {
    return (
      <AuthGuard>
        <MainLayout title="Project Not Found">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Project not found or you don't have access</p>
            <Button variant="outline" asChild>
              <Link to="/projects">Back to Projects</Link>
            </Button>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout title={selectedProject.name}>
        {/* New Header Section based on shadcn_ui_project_page_plan.md */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card sticky top-0 z-10 backdrop-blur-sm">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/projects">Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {/* TODO: Add Portfolio Link if available */}
                <BreadcrumbLink href="#">{selectedProject.portfolioId || 'Portfolio'}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedProject.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <Avatar>
              {/* TODO: Add actual image source if available */}
              <AvatarImage src="/placeholder.svg" alt={selectedProject.name} />
              <AvatarFallback>{selectedProject.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-semibold">{selectedProject.name}</h1>
            <Badge variant="outline">ID: {selectedProject.initiativeCode || selectedProject.id}</Badge>
            {/* TODO: Add more relevant badges like status or phase */}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader>
                {/* Removed CardTitle and CardDescription as they are now in the header */}
                <p className="text-sm text-muted-foreground">Details and Information</p> {/* Optional: Add a generic subtitle */}
              </CardHeader>
              <CardContent className="grid gap-4">
                {/* Updated Project Info Summary using Card and Badge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <Label className="text-xs text-muted-foreground mb-1">Project Phase</Label>
                      <Badge variant="secondary" className="text-sm font-medium">{selectedProject.phase}</Badge>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <Label className="text-xs text-muted-foreground mb-1">Project Status</Label>
                      <Badge
                        variant={
                          selectedProject.status === 'completed' ? 'default' // Use 'completed' (lowercase)
                          : selectedProject.status === 'on_hold' ? 'outline' // Use 'on_hold'
                          : selectedProject.status === 'not_started' ? 'secondary' // Example: Use 'not_started' for secondary
                          : selectedProject.status === 'in_progress' ? 'destructive' // Use 'in_progress' for destructive
                          : selectedProject.status === 'cancelled' ? 'outline' // Example: Use 'cancelled' for outline
                          : selectedProject.status === 'on_track' ? 'default' // Example: Use 'on_track' for default
                          : selectedProject.status === 'delayed' ? 'destructive' // Example: Use 'delayed' for destructive
                          : selectedProject.status === 'at_risk' ? 'destructive' // Example: Use 'at_risk' for destructive
                          : 'secondary' // Fallback variant
                        }
                        className="text-sm font-medium"
                      >
                        {selectedProject.status}
                      </Badge>
                    </CardHeader>
                  </Card>
                </div>
                {/* Wrap Description in its own Card */}
                <Card>
                  <CardHeader className="p-4">
                    <Label className="text-xs text-muted-foreground mb-1">Description</Label>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Textarea value={selectedProject.description || 'No description provided.'} readOnly className="resize-none h-24 border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                  </CardContent>
                </Card>

                <Separator />

                <Tabs defaultValue="gantt" className="w-full">
                  <TabsList>
                    <TabsTrigger value="gantt"><GanttChartSquare className="mr-2 h-4 w-4" /> Gantt Chart</TabsTrigger>
                    <TabsTrigger value="milestones"><ListChecks className="mr-2 h-4 w-4" /> Milestones</TabsTrigger>
                    <TabsTrigger value="risks"><ShieldCheck className="mr-2 h-4 w-4" /> Risks</TabsTrigger>
                    <TabsTrigger value="budget"><TrendingUp className="mr-2 h-4 w-4" /> Budget Insights</TabsTrigger>
                  </TabsList>
                  <TabsContent value="gantt" className="mt-4">
                    {/* TODO: Add actual error state checking for Gantt Chart */}
                    {false ? ( // Placeholder for error condition
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          Failed to load Gantt chart data. Please try again later.
                          {/* TODO: Add Retry Button */}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Card>
                        <CardContent className="p-4"> {/* Added padding */}
                          <> {console.log("ProjectDetail props:", {milestones: selectedProject?.milestones, deliverables: selectedProject?.deliverables})} </>
                          <GanttChart
                            milestones={selectedProject.milestones || []} // Added fallback
                            deliverables={selectedProject.deliverables || []}
                          />
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  <TabsContent value="milestones" className="mt-4">
                    <MilestoneTable milestones={selectedProject.milestones} />
                  </TabsContent>
                  <TabsContent value="risks" className="mt-4">
                    <RiskTable risks={selectedProject.risks} />
                  </TabsContent>
                  <TabsContent value="budget" className="mt-4">
                    <Card>
                      <CardContent>
                        <BudgetInsights
                          totalBudget={selectedProject.budget}
                          actualSpend={selectedProject.actualCost}
                          forecastedSpend={selectedProject.forecastedSpend || 0}
                          contingencyBudget={selectedProject.budget * 0.1}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to="/projects">Back to Projects</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-12 lg:col-span-4">
            {/* Apply gradient and flex layout to Strategic Alignment Card */}
            <Card className="bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-blue-900/10 dark:via-background dark:to-blue-900/10">
              <CardHeader>
                <CardTitle>Strategic Alignment</CardTitle>
                <CardDescription>Alignment with Corporate Objectives</CardDescription>
              </CardHeader>
              {/* Use flex layout for content */}
              <CardContent className="flex items-start justify-between gap-4">
                {/* Existing StrategicAlignmentBox takes up most space */}
                <div className="flex-grow">
                  <StrategicAlignmentBox
                    projectName={selectedProject.name}
                    projectObjectives={selectedProject.corporateKPIs?.map((kpi, index) => ({
                      id: index.toString(),
                      name: kpi,
                      description: "Corporate KPI", // Consider fetching real descriptions if available
                      priority: "high", // Placeholder priority
                      tags: [selectedProject.strategicObjective || "unspecified"]
                    })) || []}
                  />
                </div>
                {/* Add Progress indicator */}
                <div className="flex flex-col items-center gap-1 pt-1">
                   {/* TODO: Calculate actual alignment percentage */}
                  <Progress value={100} className="w-16 h-2" /> {/* Removed invalid indicatorClassName prop */}
                  <span className="text-xs text-muted-foreground">100%</span>
                  <span className="text-xs text-muted-foreground">Aligned</span>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Stage Gate Progress</CardTitle>
                <CardDescription>Project Lifecycle Stages</CardDescription>
              </CardHeader>
              <CardContent>
                <StageGateProgress stageGates={selectedProject.stageGates} />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default ProjectDetailPage;
