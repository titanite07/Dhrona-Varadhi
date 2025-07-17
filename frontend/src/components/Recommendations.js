import React from 'react';
import OpportunityCard from './OpportunityCard';

function Recommendations({ opportunities, bookmarks }) {
  if (!opportunities.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">No recommendations yet.</div>;
  }
  return (
    <div className="grid gap-4">
      {opportunities.map((opportunity, idx) => (
        <OpportunityCard key={idx} opportunity={opportunity} />
      ))}
    </div>
  );
}

export default Recommendations;
