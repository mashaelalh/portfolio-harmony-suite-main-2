
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'pm' | 'viewer';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      console.log('[authStore] Starting checkAuth');
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[authStore] Session fetch result:', session, 'Error:', sessionError);
      
      if (!session) {
        console.log('[authStore] No session found, setting isAuthenticated false');
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }
      
      // If we have a session, fetch the user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, email, display_name, role, avatar_url')
        .eq('id', session.user.id)
        .single();
      console.log('[authStore] User profile fetch result:', profile, 'Error:', error);
      
      if (error || !profile) {
        console.error('[authStore] Error fetching user data:', error);
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }
      
      // Set user data
      const user: User = {
        id: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role as UserRole,
        avatarUrl: profile.avatar_url
      };
      console.log('[authStore] User authenticated:', user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('[authStore] Error checking auth:', error);
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If sign in succeeds, return early
      if (signInData?.session) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, display_name, role, avatar_url')
          .eq('id', signInData.user.id)
          .single();
          
        if (profileError || !profile) {
          console.error('Error fetching user profile:', profileError);
          throw new Error('Failed to fetch user profile');
        }
        
        const user: User = {
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          role: profile.role as UserRole,
          avatarUrl: profile.avatar_url
        };
        
        set({ user, isAuthenticated: true, isLoading: false });
        toast.success(`Welcome back, ${user.displayName}`);
        return;
      }
      
      // Removed automatic demo account creation logic.
      // If sign-in fails, it will now proceed directly to the error handling below.
      
      // If we get here, login failed for a non-demo account
      throw new Error(signInError?.message || 'Invalid login credentials');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      toast.success('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  },
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  }
}));
