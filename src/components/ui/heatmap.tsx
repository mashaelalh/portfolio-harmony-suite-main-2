import React from 'react';

const Heatmap: React.FC<{ data: Array<{ name: string; risks: Array<{ impact: string }> }> }> = ({ data }) => {
  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>
          <strong>{item.name}</strong>: {item.risks.length} risks
        </div>
      ))}
    </div>
  );
};

export default Heatmap;