import React from 'react';

const Timeline: React.FC<{ events: Array<{ date: string; description: string }> }> = ({ events }) => {
  return (
    <div>
      {events.map((event, index) => (
        <div key={index}>
          <strong>{event.date}</strong>: {event.description}
        </div>
      ))}
    </div>
  );
};

export default Timeline;