import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { useProjectStore } from '@/lib/store/projectStore';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import ProjectCard from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, ArchiveRestore, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Projects: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { projects, fetchProjects, restoreProject, deleteProject, isLoading, error } = useProjectStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [strategicObjectiveFilter, setStrategicObjectiveFilter] = useState('all');
  const [showDeletedProjects, setShowDeletedProjects] = useState(false);
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        await fetchProjects({ includeDeleted: showDeletedProjects });
        await fetchPortfolios();
      } catch (err) {
        console.error('Failed to load projects or portfolios:', err);
        toast.error('Failed to load projects. Please try again.');
      }
    };
    loadProjects();
    toast.info('Raw projects data loaded.');
    toast.info(`Show deleted projects: ${showDeletedProjects}`);
  }, [fetchProjects, fetchPortfolios, showDeletedProjects]);
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPortfolio = portfolioFilter === 'all' || project.portfolioId === portfolioFilter;
    const matchesStrategicObjective = strategicObjectiveFilter === 'all' || project.strategicObjective === strategicObjectiveFilter;
    const matchesDeletedFilter = showDeletedProjects || !project.isDeleted;
    
    return matchesSearch && matchesStatus && matchesPortfolio && matchesStrategicObjective && matchesDeletedFilter;
  });

  const handleRestoreProject = async (projectId: string) => {
    try {
      await restoreProject(projectId);
      toast.success('Project restored successfully');
    } catch (error) {
      console.error('Failed to restore project:', error);
      toast.error('Failed to restore project. Please try again.');
    }
  };

  const handlePermanentDelete = async (projectId: string) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.');
      if (confirmDelete) {
        await deleteProject(projectId, { permanent: true });
        toast.success('Project permanently deleted');
      }
    } catch (error) {
      console.error('Failed to permanently delete project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Projects">
        <div className="flex justify-center items-center h-full">
          <p>Loading projects...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Projects">
        <div className="text-center text-red-500 p-4">
          <p>Error loading projects: {error}</p>
          <Button onClick={() => fetchProjects({ includeDeleted: showDeletedProjects })}>
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <AuthGuard>
      <MainLayout title="Projects">
        <div className="grid gap-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Filters</span>
              </Button>
              <Button asChild size="sm" className="flex-1 sm:flex-initial">
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Project</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <div className="w-full sm:w-52">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-52">
                <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Portfolio Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Portfolios</SelectItem>
                    {portfolios.map(portfolio => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-52">
                <Select value={strategicObjectiveFilter} onValueChange={setStrategicObjectiveFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Strategic Objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Objectives</SelectItem>
                    <SelectItem value="digital_transformation">Digital Transformation</SelectItem>
                    <SelectItem value="operational_excellence">Operational Excellence</SelectItem>
                    <SelectItem value="customer_experience">Customer Experience</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="sustainability">Sustainability</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-deleted"
                  checked={showDeletedProjects}
                  onCheckedChange={setShowDeletedProjects}
                />
                <Label htmlFor="show-deleted">Show Deleted Projects</Label>
              </div>
            </div>
          )}
          
          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div key={project.id} className="relative">
                  <ProjectCard project={project} />
                  {project.isDeleted && (
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Restore Project"
                              onClick={() => handleRestoreProject(project.id)}
                            >
                              <ArchiveRestore className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Restore Project</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="Permanently Delete"
                              onClick={() => handlePermanentDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Permanently Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-white">
              <p className="text-muted-foreground mb-4">No projects match your search criteria</p>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Create Project</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default Projects;
