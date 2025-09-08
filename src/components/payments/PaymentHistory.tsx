'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Payment, Invoice, InvoiceStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils';

interface PaymentHistoryProps {
  clientId: string;
  onRecordPayment?: (invoice: Invoice) => void;
}

interface PaymentWithInvoice extends Payment {
  invoice: Invoice;
}

export default function PaymentHistory({ clientId, onRecordPayment }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentWithInvoice[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [clientId]);

  const loadPayments = () => {
    try {
      const clientPayments = DataService.getPaymentsByClient(clientId);
      const invoices = DataService.getInvoices();
      const clientInvoices = invoices.filter(inv => inv.clientId === clientId);

      // Find unpaid invoices that can receive payments
      const unpaid = clientInvoices.filter(inv => 
        inv.status !== InvoiceStatus.PAID && inv.total > inv.paidAmount
      );
      setUnpaidInvoices(unpaid);

      // Combine payments with their invoice information
      const paymentsWithInvoices: PaymentWithInvoice[] = clientPayments
        .map(payment => {
          const invoice = invoices.find(inv => inv.id === payment.invoiceId);
          if (!invoice) return null;
          return { ...payment, invoice };
        })
        .filter(Boolean) as PaymentWithInvoice[];

      // Sort by payment date (newest first)
      paymentsWithInvoices.sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );

      setPayments(paymentsWithInvoices);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodDisplay = (method: string): string => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentMethodIcon = (method: string): string => {
    switch (method) {
      case 'CASH': return '💵';
      case 'CREDIT_CARD': return '💳';
      case 'DEBIT_CARD': return '💳';
      case 'BANK_TRANSFER': return '🏦';
      case 'CHECK': return '📄';
      case 'DIGITAL_WALLET': return '📱';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Record Payment Section for unpaid invoices */}
        {onRecordPayment && unpaidInvoices.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Outstanding Invoices</h3>
            <p className="text-sm text-yellow-700 mb-4">
              This client has {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}.
            </p>
            <div className="space-y-2">
              {unpaidInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-600">
                      Outstanding: {formatCurrency(invoice.total - invoice.paidAmount)}
                    </div>
                  </div>
                  <button
                    onClick={() => onRecordPayment(invoice)}
                    className="btn-primary text-sm"
                  >
                    💳 Record Payment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="text-gray-400 text-5xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
          <p className="text-gray-500">
            No payments have been recorded for this client yet.
          </p>
        </div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Record Payment Section for unpaid invoices */}
      {onRecordPayment && unpaidInvoices.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-yellow-900">Outstanding Invoices</h3>
            <span className="text-sm text-yellow-700">
              {unpaidInvoices.length} invoice{unpaidInvoices.length !== 1 ? 's' : ''} pending payment
            </span>
          </div>
          <div className="space-y-2">
            {unpaidInvoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div>
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-gray-600">
                    Outstanding: {formatCurrency(invoice.total - invoice.paidAmount)} of {formatCurrency(invoice.total)}
                  </div>
                </div>
                <button
                  onClick={() => onRecordPayment(invoice)}
                  className="btn-primary text-sm"
                >
                  💳 Record Payment
                </button>
              </div>
            ))}
            {unpaidInvoices.length > 3 && (
              <div className="text-center text-sm text-yellow-600 pt-2">
                +{unpaidInvoices.length - 3} more unpaid invoice{unpaidInvoices.length - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-green-900">Total Payments Received</h3>
            <p className="text-sm text-green-600">Lifetime payment history for this client</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</div>
            <div className="text-sm text-green-600">{payments.length} payment{payments.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
          Payment History ({payments.length})
        </h4>
        
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                {/* Payment Info */}
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </h5>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {getPaymentMethodDisplay(payment.paymentMethod)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>Payment Date: {formatDate(payment.paymentDate)}</span>
                        <span>Invoice: {payment.invoice.invoiceNumber}</span>
                      </div>
                      
                      {payment.reference && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Ref:</span>
                          <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                            {payment.reference}
                          </span>
                        </div>
                      )}
                      
                      {payment.notes && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 italic">
                            &quot;{payment.notes}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Status */}
                <div className="text-right ml-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Invoice Status
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    payment.invoice.status === InvoiceStatus.PAID 
                      ? 'bg-green-100 text-green-700' 
                      : payment.invoice.status === InvoiceStatus.PARTIALLY_PAID
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {payment.invoice.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCurrency(payment.invoice.paidAmount)} / {formatCurrency(payment.invoice.total)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Methods Used</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(
            payments.reduce((acc, payment) => {
              const method = payment.paymentMethod;
              acc[method] = (acc[method] || 0) + payment.amount;
              return acc;
            }, {} as Record<string, number>)
          ).map(([method, total]) => (
            <div key={method} className="text-center p-2 bg-white rounded border">
              <div className="text-lg">{getPaymentMethodIcon(method)}</div>
              <div className="text-xs text-gray-600 mb-1">
                {getPaymentMethodDisplay(method)}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(total)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}