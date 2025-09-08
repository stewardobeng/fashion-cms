'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Client, Service, ClientService, ServiceStatus } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/utils';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ClientServiceForm from '@/components/client-services/ClientServiceForm';
import ClientServiceCard from '@/components/client-services/ClientServiceCard';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';

type ClientServiceWithDetails = ClientService & {
  client: Client;
  service: Service;
};

export default function ClientServicesPage() {
  const [clientServices, setClientServices] = useState<ClientServiceWithDetails[]>([]);
  const [filteredClientServices, setFilteredClientServices] = useState<ClientServiceWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClientService, setEditingClientService] = useState<ClientService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientServices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clientServices, searchTerm, statusFilter]);

  const loadClientServices = async () => {
    setLoading(true);
    try {
      const clientServicesData = await DataService.getClientServices();
      const clients = await DataService.getClients();
      const services = await DataService.getServices();

      // Combine client services with client and service details
      const clientServicesWithDetails: ClientServiceWithDetails[] = clientServicesData.map(cs => {
        const client = clients.find(c => c.id === cs.clientId);
        const service = services.find(s => s.id === cs.serviceId);
        
        return {
          ...cs,
          client: client!,
          service: service!,
        };
      }).filter(cs => cs.client && cs.service); // Filter out any with missing client or service

      setClientServices(clientServicesWithDetails);
    } catch (error) {
      console.error('Error loading client services:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clientServices];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cs =>
        cs.client.firstName.toLowerCase().includes(term) ||
        cs.client.lastName.toLowerCase().includes(term) ||
        cs.service.name.toLowerCase().includes(term) ||
        cs.service.category.toLowerCase().includes(term) ||
        cs.assignedStaff?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(cs => cs.status === statusFilter);
    }

    // Sort by scheduled date (newest first)
    filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

    setFilteredClientServices(filtered);
  };

  const handleAddClientService = () => {
    setEditingClientService(null);
    setShowForm(true);
  };

  const handleEditClientService = (clientService: ClientService) => {
    setEditingClientService(clientService);
    setShowForm(true);
  };

  const handleDeleteClientService = async (clientServiceId: string) => {
    if (window.confirm('Are you sure you want to delete this client service?')) {
      try {
        await DataService.deleteClientService(clientServiceId);
        loadClientServices();
      } catch (error) {
        console.error('Error deleting client service:', error);
        alert('Failed to delete client service. Please try again.');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingClientService(null);
    loadClientServices();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClientService(null);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: ServiceStatus | '') => {
    setStatusFilter(status);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: ServiceStatus.SCHEDULED, label: 'Scheduled' },
    { value: ServiceStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ServiceStatus.COMPLETED, label: 'Completed' },
    { value: ServiceStatus.CANCELLED, label: 'Cancelled' },
    { value: ServiceStatus.NO_SHOW, label: 'No Show' },
    { value: ServiceStatus.RESCHEDULED, label: 'Rescheduled' },
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
              onClick={handleAddClientService}
              className="btn-primary"
            >
              Assign Service
            </button>
          }
        />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search by client name, service, staff, or category..."
                  onSearch={handleSearch}
                />
              </div>
              <FilterDropdown
                options={statusOptions}
                value={statusFilter}
                onChange={(value) => handleStatusFilter(value as ServiceStatus | '')}
                placeholder="Filter by status"
              />
            </div>

            {/* Client Services List */}
            {filteredClientServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {clientServices.length === 0 ? 'No service assignments yet' : 'No services match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {clientServices.length === 0 
                    ? 'Get started by assigning services to your clients.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {clientServices.length === 0 && (
                  <button
                    onClick={handleAddClientService}
                    className="btn-primary"
                  >
                    Assign Your First Service
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClientServices.map((clientService) => (
                  <ClientServiceCard
                    key={clientService.id}
                    clientService={clientService}
                    onEdit={handleEditClientService}
                    onDelete={handleDeleteClientService}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Client Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingClientService ? 'Edit Service Assignment' : 'Assign New Service'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <ClientServiceForm
                clientService={editingClientService}
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