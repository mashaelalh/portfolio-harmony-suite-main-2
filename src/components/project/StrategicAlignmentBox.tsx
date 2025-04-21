import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Link2, Crosshair } from 'lucide-react';

interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface StrategicAlignmentBoxProps {
  projectObjectives: StrategicObjective[];
  projectName: string;
}

const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'low': return 'bg-muted text-muted-foreground';
    case 'medium': return 'bg-amber-100 text-amber-800';
    case 'high': return 'bg-green-100 text-green-800';
  }
};

const StrategicAlignmentBox: React.FC<StrategicAlignmentBoxProps> = ({ 
  projectObjectives, 
  projectName 
}) => {
  const totalObjectives = projectObjectives.length;
  const highPriorityObjectives = projectObjectives.filter(obj => obj.priority === 'high').length;
  const alignmentPercentage = (highPriorityObjectives / totalObjectives) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Alignment
          </div>
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" />
            <span>{alignmentPercentage.toFixed(0)}% Aligned</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Project Context</p>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{projectName}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Alignment Metrics</p>
            <div className="flex justify-between">
              <span>Total Objectives</span>
              <span className="font-semibold">{totalObjectives}</span>
            </div>
            <div className="flex justify-between">
              <span>High Priority</span>
              <span className="font-semibold">{highPriorityObjectives}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Strategic Objectives</p>
          <div className="space-y-2">
            {projectObjectives.map((objective) => (
              <div 
                key={objective.id} 
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{objective.name}</h4>
                  <Badge 
                    className={`${getPriorityColor(objective.priority)} text-xs`}
                  >
                    {objective.priority.charAt(0).toUpperCase() + objective.priority.slice(1)} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {objective.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {objective.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategicAlignmentBox;