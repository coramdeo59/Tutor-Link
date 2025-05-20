import React from 'react';

interface WelcomeBannerProps {
  parentName: string;
  upcomingSessions: number;
  onFindTutors: () => void;
  onScheduleSession: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ parentName, upcomingSessions, onFindTutors, onScheduleSession }) => {
  return (
    <div className="bg-amber-50 p-5 rounded-lg shadow-md mb-6 border border-amber-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome back, {parentName}!</h2>
      <p className="text-gray-600 mb-4">You have {upcomingSessions} upcoming sessions.</p>
      <div className="flex gap-3">
        <button onClick={onFindTutors} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Find Tutors
        </button>
        <button onClick={onScheduleSession} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Schedule Session
        </button>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  stats: {
    children: { count: number; names: string };
    tutors: { count: number; description: string };
    sessions: { count: number; description: string };
    spending: { value: number; formatted: string; description: string };
  };
  isLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-amber-50 p-5 rounded-lg shadow-md mb-6 border border-amber-100 animate-pulse">
        <div className="h-6 bg-amber-100 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-amber-100 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-amber-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 p-5 rounded-lg shadow-md mb-6 border border-amber-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-gray-600">Children</div>
          <div className="text-2xl font-bold text-gray-800">{stats.children.count}</div>
          <div className="text-sm text-gray-500">{stats.children.names}</div>
        </div>
        <div>
          <div className="text-gray-600">Tutors</div>
          <div className="text-2xl font-bold text-gray-800">{stats.tutors.count}</div>
          <div className="text-sm text-gray-500">{stats.tutors.description}</div>
        </div>
        <div>
          <div className="text-gray-600">Sessions</div>
          <div className="text-2xl font-bold text-gray-800">{stats.sessions.count}</div>
          <div className="text-sm text-gray-500">{stats.sessions.description}</div>
        </div>
        <div>
          <div className="text-gray-600">Spending</div>
          <div className="text-2xl font-bold text-gray-800">{stats.spending.formatted}</div>
          <div className="text-sm text-gray-500">{stats.spending.description}</div>
        </div>
      </div>
    </div>
  );
};

interface ChildrenOverviewProps {
  data: any[];
  loading: boolean;
  error: any;
  onViewDetails: (childId: string) => void;
}

const ChildrenOverview: React.FC<ChildrenOverviewProps> = ({ data, loading, error, onViewDetails }) => {
  if (loading) {
    return (
      <div className="bg-amber-50 p-5 rounded-lg shadow-md border border-amber-100 animate-pulse">
        <div className="h-6 bg-amber-100 rounded w-1/3 mb-3"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-2 border-b border-amber-100 last:border-b-0">
            <div className="h-10 w-10 bg-amber-100 rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-amber-100 rounded w-3/4"></div>
              <div className="h-3 bg-amber-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading children data.</div>;
  }

  return (
    <div className="bg-amber-50 p-5 rounded-lg shadow-md border border-amber-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Children Overview</h2>
      {data.length === 0 ? (
        <p className="text-gray-600">No children added yet.</p>
      ) : (
        <ul>
          {data.map((child) => (
            <li key={child.id} className="flex items-center space-x-4 py-2 border-b border-amber-100 last:border-b-0">
              <img src={child.avatar || "/placeholder.svg"} alt={child.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{child.name}</h3>
                <p className="text-gray-600">Grade: {child.grade}</p>
              </div>
              <button onClick={() => onViewDetails(child.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface PaymentSummaryProps {
  data: any;
  loading: boolean;
  error: any;
  onPayNow: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ data, loading, error, onPayNow }) => {
  if (loading) {
    return (
      <div className="bg-amber-50 p-5 rounded-lg shadow-md border border-amber-100 animate-pulse">
        <div className="h-6 bg-amber-100 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-amber-100 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-amber-100 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading payment data.</div>;
  }

  return (
    <div className="bg-amber-50 p-5 rounded-lg shadow-md border border-amber-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Summary</h2>
      <p className="text-gray-600 mb-2">Outstanding Balance: <span className="font-bold text-gray-800">{data.outstandingBalance}</span></p>
      <p className="text-gray-600 mb-4">Due Date: {data.dueDate}</p>
      <button onClick={onPayNow} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Pay Now
      </button>
    </div>
  );
};

interface ParentDashboardProps {
  welcomeLoading: boolean;
  welcomeData: any;
  statsLoading: boolean;
  stats: any;
  childrenLoading: boolean;
  childrenData: any[];
  childrenError: any;
  paymentLoading: boolean;
  paymentData: any;
  paymentError: any;
  handleFindTutors: () => void;
  handleScheduleSession: () => void;
  handleViewChildDetails: (childId: string) => void;
  handlePayNow: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
  welcomeLoading,
  welcomeData,
  statsLoading,
  stats,
  childrenLoading,
  childrenData,
  childrenError,
  paymentLoading,
  paymentData,
  paymentError,
  handleFindTutors,
  handleScheduleSession,
  handleViewChildDetails,
  handlePayNow,
}) => {
  return (
    <div className="bg-amber-50/30 min-h-screen">
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Welcome Banner */}
        {welcomeLoading ? (
          <div className="bg-amber-50 p-5 rounded-lg mb-6 border border-amber-100 animate-pulse">
            <div className="h-6 bg-amber-100 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-amber-100 rounded w-3/4 mb-4"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-amber-100 rounded w-28"></div>
              <div className="h-10 bg-amber-100 rounded w-36"></div>
            </div>
          </div>
        ) : (
          <WelcomeBanner
            parentName={welcomeData.name}
            upcomingSessions={welcomeData.upcomingSessions}
            onFindTutors={handleFindTutors}
            onScheduleSession={handleScheduleSession}
          />
        )}
        
        {/* Dashboard Stats */}
        <DashboardStats 
          stats={stats || {
            children: { count: 0, names: '' },
            tutors: { count: 0, description: '' },
            sessions: { count: 0, description: '' },
            spending: { value: 0, formatted: '$0', description: '' }
          }} 
          isLoading={statsLoading} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Children Overview */}
          <div className="lg:col-span-3">
            <ChildrenOverview
              data={childrenData}
              loading={childrenLoading}
              error={childrenError}
              onViewDetails={handleViewChildDetails}
            />
          </div>
          
          {/* Payment Summary */}
          <div className="lg:col-span-2">
            <PaymentSummary
              data={paymentData}
              loading={paymentLoading}
              error={paymentError}
              onPayNow={handlePayNow}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
