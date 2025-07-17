import React, { useEffect, useRef, useState } from 'react';
import OpportunityCard from './OpportunityCard';

function GlassdoorCarousel({ opportunities, loading, bookmarkedIds = [], onBookmarkToggle }) {
  const carouselRef = useRef();
  const [index, setIndex] = useState(0);
  const max = Math.max(0, (opportunities?.length || 0) - 1);

  useEffect(() => {
    if (!opportunities || opportunities.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev >= max ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [opportunities, max]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * 360,
        behavior: 'smooth',
      });
    }
  }, [index]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1,2,3].map(i => (
          <div key={i} className="min-w-[340px] max-w-xs flex-shrink-0 p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md animate-pulse h-[220px]" />
        ))}
      </div>
    );
  }
  if (!opportunities?.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">No opportunities found.</div>;
  }
  return (
    <div
      ref={carouselRef}
      className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 transition-all duration-500 ease-in-out focus:outline-none"
      tabIndex={0}
      aria-label="Glassdoor job carousel"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {opportunities.filter(o => o.title && o.title.trim()).map((opportunity, idx) => (
        <div
          key={idx}
          className={`min-w-[340px] max-w-xs flex-shrink-0 h-full scroll-snap-align-start transform transition-transform duration-300 hover:scale-105 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-0`}
          aria-current={index === idx}
        >
          <OpportunityCard
            opportunity={opportunity}
            isBookmarked={bookmarkedIds.includes(opportunity.url)}
            onBookmarkToggle={onBookmarkToggle}
          />
        </div>
      ))}
    </div>
  );
}

export default GlassdoorCarousel; 