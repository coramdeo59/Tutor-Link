'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from './payment-form';
import PaymentService, { type PaymentResponse } from '@/services/payment.service';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface Invoice {
  id: string;
  date: Date;
  dueDate: Date;
  amount: number;
  status: PaymentStatus;
  description: string;
  tutorName: string;
  paymentId?: string;
  paymentMethod?: string;
}

// Mock data for invoices (fallback in case API fails)
const mockInvoices: Invoice[] = [
  {
    id: "INV-2025-001",
    date: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    amount: 120,
    status: 'pending',
    description: "Math Tutoring - Emma Smith (3 sessions)",
    tutorName: "Mr. Johnson"
  },
  {
    id: "INV-2025-002",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    amount: 200,
    status: 'paid',
    description: "Science Tutoring - Emma Smith (5 sessions)",
    tutorName: "Dr. Smith",
    paymentId: "pay_12345",
    paymentMethod: "Chapa"
  },
];

const statusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
};

const statusIcons: Record<PaymentStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  paid: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />,
  refunded: <AlertCircle className="h-4 w-4" />,
};

export function PaymentCenterContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch this from your API
        // const response = await PaymentService.getPaymentHistory(userId);
        // setInvoices(response.data);
        
        // For now, use mock data
        setInvoices(mockInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment history. Using demo data.',
          variant: 'destructive',
        });
        setInvoices(mockInvoices);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful',
      description: 'Your payment has been processed successfully.',
    });
    setIsPaymentDialogOpen(false);
    // Refresh the invoices list
    setInvoices([...invoices]);
  };

  const handlePaymentError = (error: Error) => {
    toast({
      title: 'Payment Failed',
      description: error.message || 'Failed to process payment. Please try again.',
      variant: 'destructive',
    });
  };

  const handlePayNow = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };

  const handleDownloadReceipt = (invoice: Invoice) => {
    // In a real app, this would generate and download a PDF receipt
    toast({
      title: 'Receipt Download',
      description: 'Downloading receipt...',
    });
    console.log('Downloading receipt for invoice:', invoice.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Center</h2>
          <p className="text-muted-foreground">
            View and manage your payment history and invoices
          </p>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Make a Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Make a Payment</DialogTitle>
              <DialogDescription>
                {selectedInvoice 
                  ? `Pay ${selectedInvoice.amount} ETB for ${selectedInvoice.description}`
                  : 'Enter payment details below.'}
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              amount={selectedInvoice?.amount || 0}
              description={selectedInvoice?.description || 'Tutoring Services'}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setIsPaymentDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No invoices match your search criteria.' 
                  : 'You don\'t have any invoices yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {invoice.description}
                      </TableCell>
                      <TableCell>{invoice.tutorName}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{invoice.amount.toFixed(2)} ETB</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[invoice.status]} hover:${statusColors[invoice.status]} flex items-center gap-1`}>
                          {statusIcons[invoice.status]}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.status === 'pending' ? (
                            <Button 
                              size="sm" 
                              onClick={() => handlePayNow(invoice)}
                            >
                              Pay Now
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownloadReceipt(invoice)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentCenterContent;
