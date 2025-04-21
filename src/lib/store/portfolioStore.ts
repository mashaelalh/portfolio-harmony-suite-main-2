import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PortfolioType = 'sports' | 'assets' | 'corporate';

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  type: PortfolioType;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
  events?: Array<{ date: string; description: string }>;
}

interface PortfolioState {
  portfolios: Portfolio[];
  isLoading: boolean;
  error: string | null;
  fetchPortfolios: () => Promise<void>;
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt' | 'projectCount'>) => Promise<void>;
  updatePortfolio: (id: string, data: Partial<Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  isLoading: false,
  error: null,
  fetchPortfolios: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch portfolios from Supabase
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          id, 
          name, 
          description, 
          type, 
          created_at,
          updated_at,
          projects:projects(id)
        `);
      
      if (error) throw error;
      
      // Transform data to match our Portfolio interface
      const portfoliosWithCount = data.map((portfolio) => ({
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description || '',
        type: portfolio.type as PortfolioType,
        projectCount: Array.isArray(portfolio.projects) ? portfolio.projects.length : 0,
        createdAt: portfolio.created_at,
        updatedAt: portfolio.updated_at,
      }));
      
      set({ portfolios: portfoliosWithCount, isLoading: false });
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to load portfolios');
    }
  },
  addPortfolio: async (portfolioData) => {
    set({ isLoading: true, error: null });
    try {
      // Insert portfolio into Supabase
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          name: portfolioData.name,
          description: portfolioData.description,
          type: portfolioData.type
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to state
      const newPortfolio: Portfolio = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: data.type as PortfolioType,
        projectCount: 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set(state => ({ 
        portfolios: [...state.portfolios, newPortfolio],
        isLoading: false 
      }));
      
      toast.success('Portfolio created successfully');
    } catch (error) {
      console.error('Error adding portfolio:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to create portfolio');
    }
  },
  updatePortfolio: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Update portfolio in Supabase
      const { error } = await supabase
        .from('portfolios')
        .update({
          name: data.name,
          description: data.description,
          type: data.type
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in state
      set(state => ({
        portfolios: state.portfolios.map(portfolio => 
          portfolio.id === id 
            ? { 
                ...portfolio, 
                ...data, 
                updatedAt: new Date().toISOString() 
              } 
            : portfolio
        ),
        isLoading: false
      }));
      
      toast.success('Portfolio updated successfully');
    } catch (error) {
      console.error('Error updating portfolio:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to update portfolio');
    }
  },
  deletePortfolio: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Delete portfolio from Supabase
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from state
      set(state => ({
        portfolios: state.portfolios.filter(portfolio => portfolio.id !== id),
        isLoading: false
      }));
      
      toast.success('Portfolio deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to delete portfolio');
    }
  }
}));
