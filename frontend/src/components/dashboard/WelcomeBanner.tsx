import React from 'react';

interface WelcomeBannerProps {
  parentName: string;
  upcomingSessions: number;
  onFindTutors: () => void;
  onScheduleSession: () => void;
}

/**
 * Welcome Banner Component
 * Displays a personalized welcome message with session count and action buttons
 * Styled to exactly match the design from the screenshot
 */
const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  parentName,
  upcomingSessions,
  onFindTutors,
  onScheduleSession
}) => {
  return (
    <div className="bg-amber-50 p-4 rounded-md mb-6">
      <h2 className="font-semibold mb-0.5">Welcome back, {parentName}!</h2>
      <p className="text-sm text-gray-700 mb-4">Your children have {upcomingSessions} upcoming sessions this week</p>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onFindTutors}
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-1.5 rounded-md"
        >
          Find Tutors
        </button>
        
        <button 
          onClick={onScheduleSession}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm px-4 py-1.5 rounded-md"
        >
          Schedule Session
        </button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
