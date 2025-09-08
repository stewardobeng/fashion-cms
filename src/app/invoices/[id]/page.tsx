'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { Invoice, Client, ClientService, Service } from '@/types';
import { formatDate, getInvoiceStatusColor } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PaymentForm from '@/components/payments/PaymentForm';

type InvoiceWithDetails = Invoice & {
  client: Client;
  services: (ClientService & { service: Service })[];
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadInvoice(params.id as string);
    }
  }, [params.id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const invoiceData = await DataService.getInvoice(invoiceId);
      if (!invoiceData) {
        router.push('/invoices');
        return;
      }

      const client = await DataService.getClient(invoiceData.clientId);
      if (!client) {
        router.push('/invoices');
        return;
      }

      const allServices = await DataService.getServices();
      const allClientServices = await DataService.getClientServices();
      
      const services = invoiceData.clientServiceIds
        .map(csId => {
          const clientService = allClientServices.find(cs => cs.id === csId);
          if (!clientService) return null;
          
          const service = allServices.find(s => s.id === clientService.serviceId);
          if (!service) return null;
          
          return { ...clientService, service };
        })
        .filter(Boolean) as (ClientService & { service: Service })[];

      setInvoice({
        ...invoiceData,
        client,
        services,
      });
    } catch (error) {
      console.error('Error loading invoice:', error);
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    // Navigate to edit page (to be implemented)
    console.log('Edit invoice:', invoice?.id);
  };

  const handleBack = () => {
    router.push('/invoices');
  };

  const handleRecordPayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentFormSubmit = () => {
    setShowPaymentForm(false);
    if (invoice) {
      loadInvoice(invoice.id);
    }
  };

  const handlePaymentFormCancel = () => {
    setShowPaymentForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
          <button onClick={handleBack} className="btn-primary">
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .print-container { 
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
          }
        }
        .print-only { display: none; }
      `}</style>

      <div className="min-h-screen bg-gray-50 pt-16 no-print">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <Header 
            action={
              <div className="flex items-center space-x-3">
                {invoice && invoice.total > invoice.paidAmount && (
                  <button
                    onClick={handleRecordPayment}
                    className="btn-primary"
                  >
                    💳 Record Payment
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="btn-secondary"
                >
                  🖨️ Print Invoice
                </button>
                <button
                  onClick={handleEdit}
                  className="btn-secondary"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleBack}
                  className="btn-secondary"
                >
                  ← Back to Invoices
                </button>
              </div>
            }
          />
          
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <InvoiceView invoice={invoice} />
            </div>
          </main>
        </div>
      </div>

      {/* Print Version */}
      <div className="print-only">
        <InvoiceView invoice={invoice} isPrint={true} />
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Record Payment for Invoice {invoice.invoiceNumber}</h2>
                <button
                  onClick={handlePaymentFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <PaymentForm
                invoice={invoice}
                onSubmit={handlePaymentFormSubmit}
                onCancel={handlePaymentFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface InvoiceViewProps {
  invoice: InvoiceWithDetails;
  isPrint?: boolean;
}

function InvoiceView({ invoice, isPrint = false }: InvoiceViewProps) {
  const { formatAmount } = useCurrency();
  
  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${isPrint ? 'print-container' : ''}`}>
      {/* Invoice Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-lg text-gray-600 mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-primary-600">Fashion CMS</h2>
            <p className="text-sm text-gray-600 mt-1">Professional Fashion Services</p>
            <p className="text-sm text-gray-600">123 Fashion Street</p>
            <p className="text-sm text-gray-600">New York, NY 10001</p>
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Bill To
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {invoice.client.firstName} {invoice.client.lastName}
              </p>
              <p>{invoice.client.email}</p>
              <p>{invoice.client.phone}</p>
              <p className="mt-2">
                {invoice.client.address.street}<br />
                {invoice.client.address.city}, {invoice.client.address.state} {invoice.client.address.zipCode}<br />
                {invoice.client.address.country}
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Invoice Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={getInvoiceStatusColor(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="text-gray-900">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.paymentDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="text-gray-900">{formatDate(invoice.paymentDate)}</span>
                </div>
              )}
              {invoice.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900">
                    {invoice.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="px-8 py-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Services Provided
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Completed
                </th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.services.map((serviceItem) => {
                const price = serviceItem.customPrice || serviceItem.service.basePrice;
                return (
                  <tr key={serviceItem.id}>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{serviceItem.service.name}</p>
                        <p className="text-sm text-gray-600">{serviceItem.service.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {serviceItem.service.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {serviceItem.completedDate ? formatDate(serviceItem.completedDate) : 'N/A'}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {serviceItem.assignedStaff || 'Not assigned'}
                    </td>
                    <td className="py-4 text-right font-medium text-gray-900">
                      {formatAmount(price)}
                      {serviceItem.customPrice && (
                        <span className="text-xs text-gray-500 block">(Custom Price)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Totals */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-sm ml-auto">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatAmount(invoice.subtotal)}</span>
            </div>
            
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({invoice.tax}%):</span>
                <span className="text-gray-900">
                  {formatAmount((invoice.subtotal * invoice.tax) / 100)}
                </span>
              </div>
            )}
            
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount ({invoice.discount}%):</span>
                <span>-{formatAmount((invoice.subtotal * invoice.discount) / 100)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatAmount(invoice.total)}</span>
              </div>
            </div>
            
            {invoice.paidAmount > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formatAmount(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Balance Due:</span>
                  <span className={invoice.total - invoice.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatAmount(invoice.total - invoice.paidAmount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="px-8 py-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Notes
          </h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-8 py-6 bg-gray-100 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>Thank you for choosing our fashion services!</p>
          <p className="mt-1">For questions about this invoice, please contact us at info@fashioncms.com</p>
        </div>
      </div>
    </div>
  );
}