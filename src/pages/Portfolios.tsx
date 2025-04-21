
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePortfolioStore, PortfolioType } from '@/lib/store/portfolioStore';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Portfolios: React.FC = () => {
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);
  
  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || portfolio.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <AuthGuard>
      <MainLayout title="Portfolios">
        <div className="grid gap-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                type="search" 
                placeholder="Search portfolios..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            
            <div className="flex w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/portfolios/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Portfolio</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="w-full sm:w-52">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tabs & Portfolios Grid */}
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              <p className="text-sm text-muted-foreground">
                Showing {filteredPortfolios.length} of {portfolios.length} portfolios
              </p>
            </div>
            
            <TabsContent value="grid">
              {filteredPortfolios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPortfolios.map(portfolio => (
                    <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-white">
                  <p className="text-muted-foreground mb-4">No portfolios match your search criteria</p>
                  <Button asChild>
                    <Link to="/portfolios/new">
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Create Portfolio</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list">
              {filteredPortfolios.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full bg-white">
                    <thead className="bg-muted/30">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Projects</th>
                        <th className="text-left py-3 px-4 font-medium">Last Updated</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPortfolios.map(portfolio => (
                        <tr key={portfolio.id} className="border-b last:border-0 hover:bg-muted/10">
                          <td className="py-3 px-4 font-medium">{portfolio.name}</td>
                          <td className="py-3 px-4 capitalize">{portfolio.type}</td>
                          <td className="py-3 px-4">{portfolio.projectCount}</td>
                          <td className="py-3 px-4">{new Date(portfolio.updatedAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/portfolios/${portfolio.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-white">
                  <p className="text-muted-foreground mb-4">No portfolios match your search criteria</p>
                  <Button asChild>
                    <Link to="/portfolios/new">
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Create Portfolio</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default Portfolios;
