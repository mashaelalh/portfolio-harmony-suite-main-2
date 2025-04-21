import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react/jsx-runtime';

// Helper function to capitalize words
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Basic mapping for path segments to display names (can be expanded)
const pathDisplayNames: { [key: string]: string } = {
  portfolios: 'Portfolios',
  projects: 'Projects',
  create: 'Create',
  edit: 'Edit',
  // Add more mappings as needed
};

const BreadcrumbNavigation: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Hide breadcrumbs on the root dashboard for now
  if (pathnames.length === 0) {
    return <h1 className="text-xl md:text-2xl font-semibold truncate">Dashboard</h1>; // Or return null if preferred
  }

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          // Attempt to get a display name, fallback to capitalized value, ignore UUIDs
          const displayName = pathDisplayNames[value.toLowerCase()] || (value.length > 20 ? 'Detail' : capitalize(value.replace(/-/g, ' '))); 

          // Basic check to hide potential UUIDs or long IDs from breadcrumbs
          if (value.length > 20 && last) {
             // If it's the last item and looks like an ID, show a generic name like 'Detail'
             return (
               <Fragment key={to}>
                 <BreadcrumbSeparator />
                 <BreadcrumbItem>
                   <BreadcrumbPage>Detail</BreadcrumbPage>
                 </BreadcrumbItem>
               </Fragment>
             );
          } else if (value.length > 20) {
            // Skip long IDs if they are not the last segment
            return null; 
          }


          return (
            <Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNavigation;