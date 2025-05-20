# Parent Dashboard Components

This directory contains modular components for the Tutor-Link parent dashboard. Each component is designed to be reusable, maintainable, and easily integrated with various data sources.

## Component Structure

```
dashboard/
├── WelcomeBanner.tsx - Personalized welcome message with session count
├── StatsCard.tsx - Individual stat display component
├── DashboardStats.tsx - Collection of statistics
├── ChildrenOverview.tsx - Display of children profiles and progress
├── PaymentSummary.tsx - Payment information and recent transactions
└── ParentDashboard.tsx - Main container component integrating all parts
```

## Integration Guide

### Backend API Requirements

The dashboard components work with the following API endpoints:

1. **Parent Data API**: `GET /users/parent/:id`
   - Returns basic parent information including name and upcoming session count

2. **Dashboard Stats API**: `GET /users/parent/:id/dashboard/stats`
   - Returns statistics for children, tutors, sessions, and spending

3. **Children Overview API**: `GET /users/parent/:id/dashboard/children`
   - Returns children data including progress and next session information

4. **Payment Data API**: `GET /payment/parent/:id/dashboard`
   - Returns upcoming payments and recent transactions

### Data Types

The component system uses the following data types from `lib/types.ts`:

```typescript
// Parent Stats
interface ChildrenStat { count: number; names: string; }
interface TutorsStat { count: number; description: string; }
interface SessionsStat { count: number; description: string; }
interface SpendingStat { value: number; formatted: string; description: string; }
interface ParentStats { children: ChildrenStat; tutors: TutorsStat; sessions: SessionsStat; spending: SpendingStat; }

// Children Data
interface ChildData { id: string; name: string; age: number; grade: string; progress: number; nextSession?: string; }
interface ChildrenData { children: ChildData[]; }

// Payment Data
interface UpcomingPayment { amount: number; dueDate: string; }
interface Transaction { id: string; tutorName: string; subject: string; amount: number; date: string; }
interface PaymentData { upcomingPayment?: UpcomingPayment; transactions: Transaction[]; }
```

### Step-by-Step Integration

#### 1. Import the main ParentDashboard component:

```tsx
import ParentDashboard from "@/components/dashboard/ParentDashboard";
```

#### 2. Use the component in your page:

```tsx
export default function ParentDashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Parent Dashboard</h1>
      <ParentDashboard />
    </>
  );
}
```

#### 3. Customize API integration:

The dashboard uses the `DashboardService` from `services/dashboard.service.ts`. This service includes methods to fetch data from your backend APIs. You should:

1. Update the `API_URL` constant to point to your backend
2. Modify the API paths if needed
3. Adjust the response transformation to match your backend's data format

#### 4. Testing with Mock Data:

For development and testing before connecting to the real backend, use the provided `useMockDashboard` hook:

```tsx
import { useMockDashboard } from "@/hooks/useMockDashboard";

// In your component:
const mockData = useMockDashboard();

// Pass mock data to components for testing
```

## Customizing Components

### WelcomeBanner

```tsx
<WelcomeBanner
  parentName="Parent Name"
  upcomingSessions={5}
  onFindTutors={() => {}}
  onScheduleSession={() => {}}
/>
```

### DashboardStats

```tsx
<DashboardStats
  stats={statsData}
  isLoading={false}
/>
```

### ChildrenOverview

```tsx
<ChildrenOverview
  data={childrenData}
  loading={false}
  error={null}
  onViewDetails={(childId) => {}}
/>
```

### PaymentSummary

```tsx
<PaymentSummary
  data={paymentData}
  loading={false}
  error={null}
  onPayNow={() => {}}
/>
```

## Error Handling

All components include built-in error states and loading skeletons. These will automatically display when:

- `loading` prop is `true`
- `error` prop has a string message
- Data is `null` or empty

## Styling Customization

Each component uses Tailwind CSS classes for styling. To customize:

1. Edit the class names directly in the component files
2. Use the Tailwind configuration to modify the global color theme
3. Add custom CSS modules if needed for component-specific styles

## Performance Considerations

- The dashboard components fetch data in parallel to improve loading performance
- Each component includes optimized loading states
- Components only re-render when their specific data changes
