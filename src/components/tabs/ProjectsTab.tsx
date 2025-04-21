import React from 'react';

const ProjectsTab: React.FC<{ portfolioProjects: Array<any> }> = ({ portfolioProjects }) => {
  return (
    <div>
      {portfolioProjects.map((project, index) => (
        <div key={index}>{project.name}</div>
      ))}
    </div>
  );
};

export default ProjectsTab;