'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { 
  Client, 
  ClientService, 
  Service, 
  Invoice, 
  Measurement, 
  MeasurementSet,
  ClientStatus,
  ServiceStatus,
  InvoiceStatus,
  AgeBracket,
  SkinColor,
  UKSize,
  ColorShade,
  RefashioningType,
  EmbellishmentType,
  getAgeBracketDisplayName,
  getSkinColorDisplayName,
  getColorShadeDisplayName,
  getRefashioningTypeDisplayName,
  getEmbellishmentTypeDisplayName
} from '@/types';
import { formatDate, getClientStatusColor } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ClientMeasurements from '@/components/clients/ClientMeasurements';
import ClientServiceForm from '@/components/client-services/ClientServiceForm';
import PaymentHistory from '@/components/payments/PaymentHistory';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import PaymentForm from '@/components/payments/PaymentForm';
import ClientForm from '@/components/clients/ClientForm';


type ClientWithDetails = Client & {
  services: (ClientService & { service: Service })[];
  invoices: Invoice[];
  measurements: Measurement[];
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'invoices' | 'measurements' | 'payments' | 'others'>('overview');
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (params.id) {
      loadClientDetails(params.id as string);
    }
  }, [params.id]);

  const loadClientDetails = async (clientId: string) => {
    setLoading(true);
    try {
      const clientData = await DataService.getClient(clientId);
      if (!clientData) {
        router.push('/clients');
        return;
      }

      const allServices = await DataService.getServices();
      const clientServices = await DataService.getClientServicesByClient(clientId);
      const clientInvoices = await DataService.getInvoicesByClient(clientId);
      const clientMeasurements = DataService.getClientMeasurements(clientId);
      const clientPayments = await DataService.getPaymentsByClient(clientId);

      const servicesWithDetails = clientServices.map(cs => {
        const service = allServices.find(s => s.id === cs.serviceId);
        return { ...cs, service: service! };
      }).filter(cs => cs.service);

      setClient({
        ...clientData,
        services: servicesWithDetails,
        invoices: clientInvoices,
        measurements: clientMeasurements,
        payments: clientPayments,
      } as any);
    } catch (error) {
      console.error('Error loading client details:', error);
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = () => {
    setShowEditForm(true);
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    
    if (window.confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}? This action cannot be undone.`)) {
      try {
        await DataService.deleteClient(client.id);
        router.push('/clients');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleBack = () => {
    router.push('/clients');
  };

  const handleAssignService = () => {
    setShowServiceForm(true);
  };

  const handleServiceFormSubmit = () => {
    setShowServiceForm(false);
    if (client) {
      loadClientDetails(client.id);
    }
  };

  const handleServiceFormCancel = () => {
    setShowServiceForm(false);
  };

  const handleGenerateInvoice = () => {
    setShowInvoiceForm(true);
  };

  const handleInvoiceFormSubmit = () => {
    setShowInvoiceForm(false);
    if (client) {
      loadClientDetails(client.id);
    }
  };

  const handleInvoiceFormCancel = () => {
    setShowInvoiceForm(false);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const handlePaymentFormSubmit = () => {
    setShowPaymentForm(false);
    setSelectedInvoice(null);
    if (client) {
      loadClientDetails(client.id);
    }
  };

  const handlePaymentFormCancel = () => {
    setShowPaymentForm(false);
    setSelectedInvoice(null);
  };

  const handleEditFormSubmit = () => {
    setShowEditForm(false);
    if (client) {
      loadClientDetails(client.id);
    }
  };

  const handleEditFormCancel = () => {
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <button onClick={handleBack} className="btn-primary">
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'services', label: 'Services', count: client.services.length },
    { id: 'invoices', label: 'Invoices', count: client.invoices.length },
    { id: 'payments', label: 'Payments', count: (client as any).payments?.length || 0 },
    { id: 'measurements', label: 'Measurements', count: client.measurements.length },
    { id: 'others', label: 'Others', count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header 
          action={
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditClient}
                className="btn-secondary"
              >
                ✏️ Edit Client
              </button>
              <button
                onClick={handleDeleteClient}
                className="btn-secondary text-red-600 hover:text-red-800"
              >
                🗑️ Delete
              </button>
              <button
                onClick={handleBack}
                className="btn-primary"
              >
                ← Back to Clients
              </button>
            </div>
          }
        />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Client Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {client.firstName} {client.lastName}
                      </h1>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={getClientStatusColor(client.status)}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{client.email}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{client.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {formatAmount(client.totalSpent)}
                    </div>
                    <div className="text-sm text-gray-500">Total Spent</div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">
                      {client.services.length}
                    </div>
                    <div className="text-sm text-gray-500">Total Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">
                      {client.services.filter(s => s.status === ServiceStatus.COMPLETED).length}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">
                      {client.invoices.filter(i => i.status === InvoiceStatus.PAID).length}
                    </div>
                    <div className="text-sm text-gray-500">Paid Invoices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">
                      {client.lastServiceDate ? formatDate(client.lastServiceDate) : 'Never'}
                    </div>
                    <div className="text-sm text-gray-500">Last Service</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab client={client} />}
            {activeTab === 'services' && (
              <ServicesTab 
                services={client.services} 
                onAssignService={handleAssignService}
              />
            )}
            {activeTab === 'invoices' && <InvoicesTab invoices={client.invoices} onGenerateInvoice={handleGenerateInvoice} onRecordPayment={handleRecordPayment} />}
            {activeTab === 'payments' && <PaymentHistory clientId={client.id} onRecordPayment={handleRecordPayment} />}
            {activeTab === 'measurements' && (
              <ClientMeasurements 
                clientId={client.id} 
                measurements={client.measurements}
                onMeasurementsUpdated={() => loadClientDetails(client.id)}
              />
            )}
            {activeTab === 'others' && <OthersTab client={client} />}
          </div>
        </main>
      </div>

      {/* Service Assignment Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Assign Service to {client?.firstName} {client?.lastName}</h2>
                <button
                  onClick={handleServiceFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <ClientServiceForm
                onSubmit={handleServiceFormSubmit}
                onCancel={handleServiceFormCancel}
                preSelectedClientId={client?.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generation Form Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Generate Invoice for {client?.firstName} {client?.lastName}</h2>
                <button
                  onClick={handleInvoiceFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <InvoiceForm
                onSubmit={handleInvoiceFormSubmit}
                onCancel={handleInvoiceFormCancel}
                preSelectedClientId={client?.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Recording Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Record Payment for Invoice {selectedInvoice.invoiceNumber}</h2>
                <button
                  onClick={handlePaymentFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <PaymentForm
                invoice={selectedInvoice}
                onSubmit={handlePaymentFormSubmit}
                onCancel={handlePaymentFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Edit Client - {client?.firstName} {client?.lastName}</h2>
                <button
                  onClick={handleEditFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <ClientForm
                client={client}
                onSubmit={handleEditFormSubmit}
                onCancel={handleEditFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ client }: { client: ClientWithDetails }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{client.firstName} {client.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{client.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{client.phone}</p>
            </div>
            {client.ageBracket && (
              <div>
                <label className="text-sm font-medium text-gray-500">Age Bracket</label>
                <p className="text-gray-900">{getAgeBracketDisplayName(client.ageBracket)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Date Joined</label>
              <p className="text-gray-900">{formatDate(client.dateJoined)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Preferred Contact</label>
              <p className="text-gray-900 capitalize">{client.preferredContactMethod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="text-gray-900">
            <p>{client.address.street}</p>
            <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
            <p>{client.address.country}</p>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Services</h3>
          <div className="space-y-3">
            {client.services.slice(0, 3).map((service) => (
              <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{service.service.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(service.scheduledDate)}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  service.status === ServiceStatus.COMPLETED 
                    ? 'bg-green-100 text-green-800'
                    : service.status === ServiceStatus.SCHEDULED
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {client.services.length === 0 && (
              <p className="text-gray-500 text-sm">No services yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <div className="text-gray-900">
            {client.notes ? (
              <p>{client.notes}</p>
            ) : (
              <p className="text-gray-500 italic">No notes available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Services Tab Component
function ServicesTab({ services, onAssignService }: { 
  services: (ClientService & { service: Service })[]; 
  onAssignService: () => void;
}) {
  const { formatAmount } = useCurrency();
  
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
        <p className="text-gray-600 mb-6">This client hasn&apos;t been assigned any services.</p>
        <button
          onClick={onAssignService}
          className="btn-primary"
        >
          📋 Assign First Service
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Assign Service Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
        <button
          onClick={onAssignService}
          className="btn-primary"
        >
          📋 Assign Service
        </button>
      </div>
      
      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.service.name}</div>
                      <div className="text-sm text-gray-500">{service.service.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(service.scheduledDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      service.status === ServiceStatus.COMPLETED 
                        ? 'bg-green-100 text-green-800'
                        : service.status === ServiceStatus.SCHEDULED
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.assignedStaff || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(service.customPrice || service.service.basePrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Invoices Tab Component  
function InvoicesTab({ invoices, onGenerateInvoice, onRecordPayment }: { 
  invoices: Invoice[];
  onGenerateInvoice: () => void;
  onRecordPayment: (invoice: Invoice) => void;
}) {
  const router = useRouter();
  const { formatAmount } = useCurrency();

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
        <p className="text-gray-600 mb-6">No invoices have been generated for this client.</p>
        <button
          onClick={onGenerateInvoice}
          className="btn-primary"
        >
          💰 Generate First Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Generate Invoice Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
        <button
          onClick={onGenerateInvoice}
          className="btn-primary"
        >
          💰 Generate Invoice
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(invoice.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === InvoiceStatus.PAID 
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === InvoiceStatus.SENT
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                      {invoice.status !== InvoiceStatus.PAID && invoice.total > invoice.paidAmount && (
                        <button 
                          onClick={() => onRecordPayment(invoice)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Others Tab Component
function OthersTab({ client }: { client: ClientWithDetails }) {
  return (
    <div className="space-y-6">
      {/* UK Size Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">UK Size Chart</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Object.values(UKSize).map((size) => (
              <div
                key={size}
                className={`p-3 text-center rounded-lg border-2 ${
                  client.ukSize === size
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                Size {size}
              </div>
            ))}
          </div>
          {!client.ukSize && (
            <p className="text-gray-500 text-sm mt-3 italic">No UK size selected</p>
          )}
        </div>
      </div>

      {/* Client Preferences Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skin Color */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skin Color</h3>
            {client.skinColor ? (
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full border-2 border-gray-300 ${
                    client.skinColor === SkinColor.DARK ? 'bg-gray-800' :
                    client.skinColor === SkinColor.BROWN ? 'bg-amber-700' :
                    client.skinColor === SkinColor.FAIR ? 'bg-amber-100' :
                    'bg-yellow-200'
                  }`}
                ></div>
                <span className="text-gray-900 font-medium">
                  {getSkinColorDisplayName(client.skinColor)}
                </span>
              </div>
            ) : (
              <p className="text-gray-500 italic">No skin color specified</p>
            )}
          </div>
        </div>

        {/* Color Shades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Shades</h3>
            {client.colorShades && client.colorShades.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {client.colorShades.map((color) => (
                  <span
                    key={color}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {getColorShadeDisplayName(color)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No color shades selected</p>
            )}
          </div>
        </div>

        {/* Refashioning Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Refashioning Preferences</h3>
            {client.refashioning && client.refashioning.selectedTypes && client.refashioning.selectedTypes.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {client.refashioning.selectedTypes.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {getRefashioningTypeDisplayName(type)}
                    </span>
                  ))}
                </div>
                {client.refashioning.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes:</label>
                    <p className="text-gray-700 text-sm mt-1">{client.refashioning.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No refashioning preferences set</p>
            )}
          </div>
        </div>

        {/* Embellishments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Embellishments</h3>
            {client.embellishments && client.embellishments.selectedTypes && client.embellishments.selectedTypes.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {client.embellishments.selectedTypes.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {getEmbellishmentTypeDisplayName(type)}
                    </span>
                  ))}
                </div>
                {client.embellishments.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes:</label>
                    <p className="text-gray-700 text-sm mt-1">{client.embellishments.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No embellishment preferences set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}