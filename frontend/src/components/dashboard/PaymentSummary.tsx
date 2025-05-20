import React from 'react';
import { PaymentData } from '../../lib/types';

interface PaymentSummaryProps {
  data: PaymentData | null;
  loading: boolean;
  error: string | null;
  onPayNow: () => void;
}

/**
 * Payment Summary Component
 * Displays upcoming payments and recent transactions
 * Styled to match exactly the design from the screenshot
 */
const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  data,
  loading,
  error,
  onPayNow
}) => {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format amount as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-5">
        <h2 className="text-base font-semibold mb-1">Payment Summary</h2>
        <p className="text-xs text-gray-500 mb-4">Recent and upcoming payments</p>
        
        <div className="animate-pulse">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Upcoming Payment</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between mb-3">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-2 bg-gray-100 rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-2 bg-gray-100 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-5">
        <h2 className="text-base font-semibold mb-1">Payment Summary</h2>
        <p className="text-red-600 text-xs">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-md shadow-sm p-5">
        <h2 className="text-base font-semibold mb-1">Payment Summary</h2>
        <p className="text-gray-500 text-xs">No payment data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-5">
      <h2 className="text-base font-semibold">Payment Summary</h2>
      <p className="text-xs text-gray-500 mb-4">Recent and upcoming payments</p>
      
      {data.upcomingPayment && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Upcoming Payment</h3>
          <div className="bg-amber-50 p-4 rounded-md">
            <div className="flex justify-between mb-3">
              <span className="text-xs text-gray-700">
                Due on {formatDate(data.upcomingPayment.dueDate)}, 2025
              </span>
              <span className="text-sm font-bold">{formatCurrency(data.upcomingPayment.amount)}</span>
            </div>
            <button 
              onClick={onPayNow}
              className="bg-amber-600 hover:bg-amber-700 text-white text-sm w-full py-1.5 rounded-md"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
      {data.transactions.length > 0 ? (
        <div>
          {data.transactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="text-xs font-medium">{transaction.tutorName}</div>
                <div className="text-xs text-gray-500">{transaction.subject}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium">{formatCurrency(transaction.amount)}</div>
                <div className="text-xs text-gray-500">May {new Date(transaction.date).getDate()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No recent transactions.</p>
      )}
    </div>
  );
};

export default PaymentSummary;
