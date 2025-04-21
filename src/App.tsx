import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EditProject from "./pages/EditProject"; // Import EditProject component
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import CreateProject from "./pages/CreateProject";
import Portfolios from "./pages/Portfolios";
import PortfolioDetail from "./pages/PortfolioDetail"; // Import PortfolioDetail component
import Unauthorized from "./pages/Unauthorized";
import ExecutiveReport from "./pages/ExecutiveReport";
import { useDarkMode } from "./hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/common/ErrorBoundary"; // Import ErrorBoundary

const queryClient = new QueryClient();

const App = () => {
  const { isDark: isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Harmony Suite</h1>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            className="px-4 py-2"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
        <BrowserRouter>
          <ErrorBoundary> {/* Wrap Routes with ErrorBoundary */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/portfolios" element={<Portfolios />} />
              <Route path="/portfolios/:id" element={<PortfolioDetail />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/executive-report" element={<ExecutiveReport />} />
              <Route path="/projects/:id/edit" element={<EditProject />} /> {/* Use EditProject component for edit route */}
              
              {/* New Route Definitions */}
              <Route path="/calendar" element={<Dashboard />} />
              <Route path="/risks" element={<Dashboard />} />
              <Route path="/teams" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
