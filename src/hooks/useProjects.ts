import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectStatus, StageGateStatus, MilestoneStatus, RiskLevel, RiskStatus } from '@/lib/store/projectStore';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          risks (*),
          milestones (*),
          stage_gates (*),
          resources (*)
        `);
      if (error) throw error;
      return data?.map((p) => ({
        ...p,
        actualCost: p.actual_cost,
        portfolioId: p.portfolio_id,
        startDate: p.start_date,
        endDate: p.end_date,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        managerId: p.manager_id,
        status: p.status as ProjectStatus,
        risks: (p.risks || []).map((r) => ({
          ...r,
          impact: r.impact as RiskLevel,
          status: r.status as RiskStatus,
        })),
        milestones: (p.milestones || []).map((m) => ({
          ...m,
          dueDate: m.due_date,
          status: m.status as MilestoneStatus,
        })),
        stageGates: (p.stage_gates || []).map((sg) => ({
          ...sg,
          updatedAt: sg.updated_at,
          stage: sg.stage as 'G0' | 'G1' | 'G2' | 'G3' | 'G4',
          status: sg.status as StageGateStatus,
        })),
        resources: (p.resources || []).map((r) => ({
          ...r,
          userId: r.user_id,
        })),
      }));
    }
  });
}