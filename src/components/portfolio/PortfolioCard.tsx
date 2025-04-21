import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Portfolio } from '@/lib/store/portfolioStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface PortfolioCardProps {
  portfolio: Portfolio;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Navigate to the portfolio detail page
    navigate(`/portfolios/${portfolio.id}`);
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sports':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sports</Badge>;
      case 'assets':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Assets</Badge>;
      case 'corporate':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Corporate</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  const lastUpdated = format(new Date(portfolio.updatedAt), 'MMM d, yyyy');

  return (
    <Card
      className="overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.02] dark:hover:bg-muted/30 cursor-pointer" // Enhanced hover effects
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">{portfolio.name}</CardTitle>
          </div>
          {getTypeIcon(portfolio.type)}
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {portfolio.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Projects</span>
            <span className="font-medium">{portfolio.projectCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{lastUpdated}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
            <Link
              to={`/portfolios/${portfolio.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="h-4 w-4" />
              <span>Details</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link
              to={`/portfolios/${portfolio.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PortfolioCard;
