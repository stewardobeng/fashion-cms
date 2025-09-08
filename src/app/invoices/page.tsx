'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { Invoice, Client, InvoiceStatus, InvoiceFilter } from '@/types';
import { formatDate, getInvoiceStatusColor } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';

type InvoiceWithClient = Invoice & { client: Client };

export default function InvoicesPage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceWithClient[]>([]);
  const [filter, setFilter] = useState<InvoiceFilter>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const invoicesData = await DataService.getInvoices();
      const clients = await DataService.getClients();

      const invoicesWithClients: InvoiceWithClient[] = invoicesData.map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        return {
          ...invoice,
          client: client!,
        };
      }).filter(invoice => invoice.client);

      setInvoices(invoicesWithClients);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await DataService.searchInvoices(filter);
      const clients = await DataService.getClients();
      
      const filteredWithClients: InvoiceWithClient[] = filtered.map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        return {
          ...invoice,
          client: client!,
        };
      }).filter(invoice => invoice.client);

      setFilteredInvoices(filteredWithClients);
    } catch (error) {
      console.error('Error filtering invoices:', error);
      setFilteredInvoices([]);
    }
  };

  const handleSearch = (searchTerm: string) => {
    // For invoices, we'll search by client name and invoice number
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  const handleStatusFilter = (status: InvoiceStatus | '') => {
    setFilter(prev => ({ 
      ...prev, 
      status: status || undefined 
    }));
  };

  const handleCreateInvoice = () => {
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    loadInvoices();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await DataService.deleteInvoice(invoiceId);
        loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: InvoiceStatus.DRAFT, label: 'Draft' },
    { value: InvoiceStatus.SENT, label: 'Sent' },
    { value: InvoiceStatus.PAID, label: 'Paid' },
    { value: InvoiceStatus.OVERDUE, label: 'Overdue' },
    { value: InvoiceStatus.PARTIALLY_PAID, label: 'Partially Paid' },
    { value: InvoiceStatus.CANCELLED, label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header 
          action={
            <button
              onClick={handleCreateInvoice}
              className="btn-primary"
            >
              Create Invoice
            </button>
          }
        />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search by client name or invoice number..."
                  onSearch={handleSearch}
                />
              </div>
              <FilterDropdown
                options={statusOptions}
                value={filter.status || ''}
                onChange={(value) => handleStatusFilter(value as InvoiceStatus | '')}
                placeholder="Filter by status"
              />
            </div>

            {/* Invoices Table */}
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {invoices.length === 0 
                    ? 'Invoices will be created when you assign services to clients.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="table-row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.invoiceNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                Due: {formatDate(invoice.dueDate)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.client.firstName} {invoice.client.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.client.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatAmount(invoice.total)}
                              </div>
                              {invoice.paidAmount > 0 && (
                                <div className="text-sm text-green-600">
                                  Paid: {formatAmount(invoice.paidAmount)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getInvoiceStatusColor(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.issueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => handleViewInvoice(invoice.id)}
                                className="text-primary-600 hover:text-primary-900 font-medium"
                              >
                                👁️ View
                              </button>
                              {invoice.total > invoice.paidAmount && (
                                <button 
                                  onClick={() => handleViewInvoice(invoice.id)}
                                  className="text-green-600 hover:text-green-900 font-medium"
                                  title="Record Payment"
                                >
                                  💳 Pay
                                </button>
                              )}
                              <button className="text-primary-600 hover:text-primary-900">
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create New Invoice</h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <InvoiceForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}