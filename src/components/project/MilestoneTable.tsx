
import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import { Milestone, MilestoneStatus } from '@/lib/store/projectStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Import Button
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react'; // Import sorting icon

interface MilestoneTableProps {
  milestones: Milestone[];
}

const MilestoneTable: React.FC<MilestoneTableProps> = ({ milestones = [] }) => { // Add default empty array
  const [sortConfig, setSortConfig] = useState<{ key: keyof Milestone | null; direction: 'ascending' | 'descending' }>({ key: 'dueDate', direction: 'ascending' });

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-risk-low">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500">In Progress</Badge>;
      case 'delayed':
        return <Badge className="bg-risk-high">Delayed</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>;
    }
  };

  const isOverdue = (dueDate: string, status: MilestoneStatus) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const sortedMilestones = useMemo(() => {
    let sortableItems = [...milestones];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (sortConfig.key === 'dueDate') {
          // Sort by date
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          if (dateA < dateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else {
           // Default string sort for name
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [milestones, sortConfig]);

  const requestSort = (key: keyof Milestone) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Milestone) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ?
      <ArrowUpDown className="ml-2 h-4 w-4" /> : // Could use ArrowUp/ArrowDown for specific direction
      <ArrowUpDown className="ml-2 h-4 w-4" />;
  };


  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button variant="ghost" onClick={() => requestSort('name')} className="px-0 hover:bg-transparent">
                Milestone
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
               <Button variant="ghost" onClick={() => requestSort('dueDate')} className="px-0 hover:bg-transparent">
                Due Date
                {getSortIcon('dueDate')}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">Status</TableHead> {/* Status not sortable for now */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.length > 0 ? (
            sortedMilestones.map((milestone) => (
              <TableRow key={milestone.id}>
                <TableCell className="font-medium">{milestone.name}</TableCell>
                <TableCell className={cn(
                  isOverdue(milestone.dueDate, milestone.status) && "text-risk-high font-medium"
                )}>
                  {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                  {isOverdue(milestone.dueDate, milestone.status) && (
                    <span className="ml-2 text-xs">Overdue</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(milestone.status)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center py-4 text-muted-foreground"> {/* Added h-24 for empty state height */}
                No milestones found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MilestoneTable;
