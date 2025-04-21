import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PortfolioType } from '@/lib/store/portfolioStore';

export function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('portfolios').select('*');
      if (error) throw error;
      return data?.map((p) => ({
        ...p,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        type: p.type as PortfolioType,
        projectCount: 0, // default to 0 or fetch separately if needed
      }));
    }
  });
}