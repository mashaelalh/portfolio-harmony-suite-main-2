import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  XCircle 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type StageGateStatus = 'completed' | 'pending' | 'in_progress' | 'delayed' | 'blocked';

interface StageGateIconProps {
  status: StageGateStatus;
  label: string;
  description?: string;
}

const StageGateIcon: React.FC<StageGateIconProps> = ({ status, label, description }) => {
  const getIconAndColor = () => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle2 className="text-risk-low h-6 w-6" />, 
          color: 'text-risk-low' 
        };
      case 'pending':
        return { 
          icon: <Circle className="text-muted-foreground h-6 w-6" />, 
          color: 'text-muted-foreground' 
        };
      case 'in_progress':
        return { 
          icon: <Clock className="text-amber-500 h-6 w-6" />, 
          color: 'text-amber-500' 
        };
      case 'delayed':
        return { 
          icon: <AlertTriangle className="text-risk-high h-6 w-6" />, 
          color: 'text-risk-high' 
        };
      case 'blocked':
        return { 
          icon: <XCircle className="text-destructive h-6 w-6" />, 
          color: 'text-destructive' 
        };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center">
            {icon}
            <span className={`text-xs mt-1 ${color}`}>{label}</span>
          </div>
        </TooltipTrigger>
        {description && (
          <TooltipContent>
            <p className="text-sm">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

interface StageGateProgressProps {
  stages: {
    name: string;
    status: StageGateStatus;
    description?: string;
  }[];
}

const StageGateProgress: React.FC<StageGateProgressProps> = ({ stages }) => {
  return (
    <div className="flex justify-between items-center w-full">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.name}>
          <StageGateIcon 
            status={stage.status} 
            label={stage.name} 
            description={stage.description} 
          />
          {index < stages.length - 1 && (
            <div className="flex-grow border-t border-muted-foreground mx-2"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export { StageGateIcon, StageGateProgress };