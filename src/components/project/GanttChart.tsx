import React, { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import { Milestone, Deliverable } from '@/lib/store/projectStore'; // Assuming Deliverable type is exported
import { parseISO, format, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Removed invalid CSS import for Vite compatibility
interface GanttChartProps {
  // Removed startDate and endDate as frappe-gantt calculates range
  milestones: Milestone[];
  deliverables?: Deliverable[]; // Add deliverables prop
}

// Define the Task type expected by frappe-gantt
interface FrappeTask {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  progress: number; // 0-100
  dependencies?: string; // comma separated task ids
  custom_class?: string; // for styling based on status/type
}

type ViewMode = 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';

const GanttChart: React.FC<GanttChartProps> = ({ milestones = [], deliverables = [] }) => {
  const ganttRef = useRef<SVGSVGElement>(null);
  const ganttInstance = useRef<Gantt | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('Month');

  useEffect(() => {
    if (!ganttRef.current) return;

    try {
      // --- Data Transformation ---
      const tasks: FrappeTask[] = [];

      // Add Milestones as zero-duration tasks
      milestones.forEach(m => {
        if (m && m.dueDate && isValid(parseISO(m.dueDate))) {
          const dateStr = format(parseISO(m.dueDate), 'yyyy-MM-dd');
          tasks.push({
            id: `m-${m.id || Math.random().toString()}`,
            name: m?.name || 'Untitled Milestone',
            start: dateStr,
            end: dateStr,
            progress: m.status === 'completed' ? 100 : 0,
            custom_class: `milestone status-${m.status}`
          });
        }
      });

      // Add Deliverables as tasks or milestones
      if (Array.isArray(deliverables)) {
        deliverables.forEach(d => {
          if (!d) return;

          const startDate = d.fromDate && isValid(parseISO(d.fromDate)) ? parseISO(d.fromDate) : null;
          const endDate = d.toDate && isValid(parseISO(d.toDate)) ? parseISO(d.toDate) : null;

          if (startDate && endDate) {
            tasks.push({
              id: `d-${d.id || Math.random().toString()}`,
              name: d?.description || 'Untitled Deliverable',
              start: format(startDate, 'yyyy-MM-dd'),
              end: format(endDate, 'yyyy-MM-dd'),
              progress: 0,
              custom_class: 'deliverable'
            });
          } else if (endDate) {
            tasks.push({
              id: `d-${d.id || Math.random().toString()}`,
              name: d?.description || 'Untitled Deliverable',
              start: format(endDate, 'yyyy-MM-dd'),
              end: format(endDate, 'yyyy-MM-dd'),
              progress: 0,
              custom_class: 'deliverable milestone'
            });
          }
        });
      }

      // Only initialize if we have tasks
      if (tasks.length > 0) {
        if (ganttInstance.current) {
          ganttInstance.current.destroy();
        }

        console.log("TASK DATA", tasks); // Log tasks array as per instructions
        const validTasks = tasks.filter(task => task && task.name); // Filter out invalid tasks
        ganttInstance.current = new Gantt(ganttRef.current, validTasks, {
          header_height: 50,
          column_width: 30,
          step: 24,
          view_modes: ['Day', 'Week', 'Month'],
          bar_height: 20,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          // view_mode: viewMode, // Use default view mode
          date_format: 'YYYY-MM-DD',
          language: 'en',
          custom_popup_html: (task) => {
            if (!task) return '';
            
            const startDate = format(parseISO(task.start), 'MMM d');
            const endDate = format(parseISO(task.end), 'MMM d');
            const isMilestone = task.custom_class?.includes('milestone');
            const duration = isMilestone ? `Date: ${startDate}` : `Duration: ${startDate} - ${endDate}`;

            return `
              <div class="frappe-gantt-popup p-2 rounded shadow-lg bg-popover border text-popover-foreground text-xs max-w-xs">
                <div class="font-semibold mb-1 break-words">${task?.name || 'Task'}</div>
                <div class="text-muted-foreground">${duration}</div>
                ${typeof task.progress !== 'undefined' && !isMilestone ? `<div class="text-muted-foreground">Progress: ${task.progress}%</div>` : ''}
              </div>
            `;
          }
        });
      } else {
        // Handle empty state
        if (ganttRef.current) {
          ganttRef.current.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="text-muted-foreground fill-current">No timeline data available</text>';
        }
      }
    } catch (error) {
      console.error('Error initializing Gantt chart:', error);
      if (ganttRef.current) {
        ganttRef.current.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="text-destructive fill-current">Error loading timeline</text>';
      }
    }

    return () => {
      if (ganttInstance.current) {
        ganttInstance.current.destroy();
        ganttInstance.current = null;
      }
    };
  }, [milestones, deliverables, viewMode]);

  // Function to change view mode
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    // No need to call ganttInstance.current?.change_view_mode(mode);
    // The useEffect hook will handle the re-render with the new viewMode
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Project Timeline</span>
          <ToggleGroup
            type="single"
            defaultValue="Month"
            value={viewMode}
            onValueChange={(value: ViewMode | null) => { if (value) changeViewMode(value); }} // Allow null temporarily if needed
            aria-label="Timeline Zoom Level"
            size="sm"
          >
            {/* <ToggleGroupItem value="Day" aria-label="Daily view">Day</ToggleGroupItem> */}
            <ToggleGroupItem value="Week" aria-label="Weekly view">Week</ToggleGroupItem>
            <ToggleGroupItem value="Month" aria-label="Monthly view">Month</ToggleGroupItem>
          </ToggleGroup>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Container for the Gantt chart */}
        <div className="gantt-container overflow-x-auto py-2">
           {/* Add custom CSS for styling frappe-gantt elements to match Shadcn */}
           {/* Custom CSS removed, using standard import */}
          <svg ref={ganttRef} style={{ width: '100%', minHeight: '150px' }}></svg> {/* Ensure min height */}
        </div>
        {/* Optional: Legend can be kept or removed if chart is clear */}
      </CardContent>
    </Card>
  );
};

export default GanttChart;
