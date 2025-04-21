
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileSearch } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle special case for /projects/new
    if (location.pathname === "/projects/new") {
      navigate("/projects/new", { replace: true });
      return;
    }
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <FileSearch className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you are looking for doesn't exist or you may not have access to it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/" className="inline-flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
            
            <Button asChild>
              <Link to="/projects" className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
