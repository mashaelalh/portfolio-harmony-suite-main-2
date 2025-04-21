
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-amber-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. Please contact your administrator for access.
        </p>
        <Button asChild>
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
