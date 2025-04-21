import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, ProjectStatus, ProjectPhase, useProjectStore } from '@/lib/store/projectStore';
import { ReusableCard, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Import ReusableCard, ensure CardDescription is imported if needed elsewhere or remove if not
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, ChevronRight, Calendar, DollarSign, Users, Trash2, ArchiveRestore, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { deleteProject, restoreProject } = useProjectStore();
  
  const handleCardClick = () => {
    if (!project.isDeleted) {
      navigate(`/projects/${project.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProject(project.id);
      toast.success(`Project "${project.name}" has been soft-deleted`);
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Delete project error:', error);
    }
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restoreProject(project.id);
      toast.success(`Project "${project.name}" has been restored`);
    } catch (error) {
      toast.error('Failed to restore project');
      console.error('Restore project error:', error);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>;
      case 'on_track':
        return <Badge className="bg-risk-low text-white">On Track</Badge>;
      case 'delayed':
        return <Badge className="bg-risk-medium text-white">Delayed</Badge>;
      case 'at_risk':
        return <Badge className="bg-risk-high text-white">At Risk</Badge>;
      case 'on_hold':
        return <Badge variant="outline">On Hold</Badge>;
      case 'completed':
        return <Badge className="bg-risk-low text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPhaseBadge = (phase?: ProjectPhase) => {
    if (!phase) return null;
    
    const phaseLabel = phase.replace('_', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return <Badge variant="outline" className="ml-2">{phaseLabel}</Badge>;
  };

  const getStageGateProgress = () => {
    const completedStages = project.stageGates.filter(sg => sg.status === 'completed').length;
    return (completedStages / project.stageGates.length) * 100;
  };

  const getBudgetProgress = () => {
    return (project.actualCost / project.budget) * 100;
  };

  const startDate = format(new Date(project.startDate), 'MMM d, yyyy');
  const endDate = format(new Date(project.endDate), 'MMM d, yyyy');

  const hasHighRisks = project.risks.some(risk => risk.impact === 'high' && risk.status === 'open');

  return (
    <ReusableCard
      className={cn(
        "overflow-hidden", // Removed hover:shadow-md as it's now on the base Card
        project.isDeleted ? "opacity-50 border-dashed border-2 border-muted-foreground" : "cursor-pointer",
        hasHighRisks && !project.isDeleted && "border-l-4 border-l-risk-high/80"
      )}
      onClick={handleCardClick}
      // Pass title and description to ReusableCard props
      cardTitle={ // Use renamed prop cardTitle
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold"> {/* Use span instead of CardTitle */}
              {project.projectCode ? `${project.projectCode}: ` : ''}{project.name}
            </span>
            {project.phase && getPhaseBadge(project.phase)}
          </div>
          {!project.isDeleted && getStatusBadge(project.status)}
        </div>
      }
      description={
        <p className="line-clamp-2 h-10 text-sm text-muted-foreground"> {/* Use p instead of CardDescription */}
          {project.description}
        </p>
      }
      isLoading={!project} // Example: Pass loading state if available
      // Pass footer content as a prop
      footer={
        <div className="flex justify-between items-center w-full pt-0"> {/* Removed CardFooter wrapper, added pt-0 */}
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {!project.isDeleted && (
              <>
                <span className="font-medium">{project.risks.filter(r => r.status === 'open').length}</span> open risks
                {hasHighRisks && (
                  <Badge className="bg-risk-high text-[10px] h-4 ml-1">High Risk</Badge>
                )}
              </>
            )}
            {project.isDeleted && (
              <Badge variant="destructive" className="text-[10px] h-4">
                Deleted {project.deletedAt && format(new Date(project.deletedAt), 'MMM d, yyyy')}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {project.isDeleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestore}
              >
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Restore
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when opening dialog
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Prevent card click inside dialog */}
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will soft-delete the project "{project.name}".
                      It can be restored for 30 days. Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete} // Call original delete handler on confirm
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirm Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!project.isDeleted && (
              <Button variant="ghost" size="icon" asChild>
                <Link
                  to={`/projects/${project.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      }
      // Pass the main content via the 'content' prop
      cardContent={ // Use renamed prop cardContent
        <div className="space-y-2"> {/* Removed padding, ReusableCard handles it */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{startDate} - {endDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                ${(project.actualCost / 1000).toFixed(0)}k / ${(project.budget / 1000).toFixed(0)}k
              </span>
            </div>
            {(project.projectOwner || project.projectSponsor) && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {project.projectOwner && `Owner: ${project.projectOwner}`}
                  {project.projectSponsor && `Sponsor: ${project.projectSponsor}`}
                </span>
              </div>
            )}
            {project.initiativeCode && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Initiative: {project.initiativeCode}
                </span>
              </div>
            )}
            {project.strategicObjective && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Strategic Objective: {project.strategicObjective
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </span>
              </div>
            )}
            {project.corporateKPIs && project.corporateKPIs.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  KPIs: {project.corporateKPIs.slice(0, 2).join(', ')}
                  {project.corporateKPIs.length > 2 && ` +${project.corporateKPIs.length - 2} more`}
                </span>
              </div>
            )}
          </div>
          
          {!project.isDeleted && (
            <div className="space-y-2"> {/* Added wrapper div with spacing */}
              <div> {/* Wrap progress bars in a div */}
                <div className="flex justify-between text-xs">
                  <span>Stage Gates</span>
                  <span className="font-medium">{
                    project.stageGates.filter(sg => sg.status === 'completed').length
                  } of {project.stageGates.length}</span>
                </div>
                <Progress value={getStageGateProgress()} className="h-1.5" />
              </div>
              <div> {/* Wrap progress bars in a div */}
                <div className="flex justify-between text-xs">
                  <span>Budget</span>
                  <span className={cn(
                    "font-medium",
                    getBudgetProgress() > 90 && "text-risk-high"
                  )}>{Math.round(getBudgetProgress())}%</span>
                </div>
                <Progress
                  value={getBudgetProgress()}
                  className={cn(
                    "h-1.5 [&>div]:bg-primary",
                    getBudgetProgress() > 90 && "[&>div]:bg-risk-high"
                  )}
                />
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default React.memo(ProjectCard);
