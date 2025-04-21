
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StageGate, StageGateStatus } from '@/lib/store/projectStore';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock, CircleDashed } from 'lucide-react';
import { format } from 'date-fns';

interface StageGateProgressProps {
  stageGates: StageGate[];
}

const StageGateProgress: React.FC<StageGateProgressProps> = ({ stageGates }) => {
  const getStatusIcon = (status: StageGateStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-risk-low" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-risk-high" />;
      case 'not_started':
      default:
        return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: StageGateStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-risk-low/10 border-risk-low/30';
      case 'in_progress':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'blocked':
        return 'bg-risk-high/10 border-risk-high/30';
      case 'not_started':
      default:
        return 'bg-muted/20 border-muted/30';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stage Gate Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-muted-foreground/10 ml-px"></div>
          
          <div className="space-y-6">
            {stageGates.map((gate, index) => (
              <div key={gate.stage} className="relative flex items-start gap-4">
                <div className={cn(
                  "flex-shrink-0 h-12 w-12 rounded-full border-2 flex items-center justify-center",
                  getStatusClass(gate.status)
                )}>
                  {getStatusIcon(gate.status)}
                </div>
                
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{gate.stage}: {
                        gate.stage === 'G0' ? 'Project Initiation' :
                        gate.stage === 'G1' ? 'Concept Development' :
                        gate.stage === 'G2' ? 'Detailed Planning' :
                        gate.stage === 'G3' ? 'Implementation' :
                        'Project Closure'
                      }</h4>
                      {gate.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{gate.notes}</p>
                      )}
                    </div>
                    
                    {gate.status !== 'not_started' && gate.updatedAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(gate.updatedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageGateProgress;
