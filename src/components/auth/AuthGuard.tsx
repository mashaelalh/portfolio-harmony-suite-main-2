
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
import { UserRole } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  allowedRoles = ['admin', 'pm', 'viewer']
}) => {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('[AuthGuard] Mounting, starting auth check');
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthGuard] Auth state changed:', event, session);
      // When auth state changes, recheck auth
      checkAuth();
    });
    
    // Initial auth check
    checkAuth().then(() => {
      console.log('[AuthGuard] Initial auth check complete');
      setIsChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  // Show toast notification for permission issues
  useEffect(() => {
    if (!isChecking && !isLoading && isAuthenticated && user && 
        allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      toast.error(`You don't have permission to access this page. Required role: ${allowedRoles.join(' or ')}`);
    }
  }, [isChecking, isLoading, isAuthenticated, user, allowedRoles]);

  // Handle loading state with a more informative message
  console.log('[AuthGuard] Render - isLoading:', isLoading, 'isChecking:', isChecking, 'isAuthenticated:', isAuthenticated, 'user:', user);

  if (isLoading || isChecking) {
    console.log('[AuthGuard] Showing loading spinner');
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Verifying access...</p>
          <p className="text-sm text-muted-foreground">Please wait while we check your permissions</p>
        </div>
      </div>
    );
  }

  // Handle not authenticated state
  if (!isAuthenticated) {
    console.log('[AuthGuard] User not authenticated, redirecting to /login');
    // Store the attempted URL to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Handle unauthorized role
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('[AuthGuard] User lacks required role, redirecting to /unauthorized');
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role
  console.log('[AuthGuard] User authenticated and authorized, rendering children');
  console.log("[AuthGuard] Rendering children NOW"); // ADD THIS LOG
  console.log("[AuthGuard] Rendering children:", children);
  return <>{children}</>;
};

export default AuthGuard;
