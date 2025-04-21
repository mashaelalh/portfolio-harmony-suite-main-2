// Fallback Database type if no original types exist
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          portfolio_id: string;
          name: string;
          description: string;
          start_date: string;
          end_date: string;
          status: string;
          budget: number;
          actual_cost: number;
          created_at: string;
          updated_at: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          restoration_eligible_until?: string | null;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          name: string;
          description?: string;
          start_date: string;
          end_date: string;
          status: string;
          budget: number;
          actual_cost?: number;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          restoration_eligible_until?: string | null;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          name?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          budget?: number;
          actual_cost?: number;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          restoration_eligible_until?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          user_id?: string | null;
          metadata?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          entity_type: string;
          entity_id: string;
          user_id?: string | null;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          user_id?: string | null;
          metadata?: any;
          created_at?: string;
        };
      };
    };
  };
};
