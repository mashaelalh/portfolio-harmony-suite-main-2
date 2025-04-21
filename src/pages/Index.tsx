
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    
    // Initial auth check
    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  // Handle redirect once auth state is determined
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        toast.success(`Welcome back, ${user.displayName}`);
        navigate('/dashboard');
      } else if (!isAuthenticated) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  // Loading state with improved UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Harmony Suite</h1>
          <p className="text-muted-foreground">Portfolio & Project Management</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
