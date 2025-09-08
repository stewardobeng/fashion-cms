'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Client, ClientFilter, ClientStatus } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ClientForm from '@/components/clients/ClientForm';
import ClientCard from '@/components/clients/ClientCard';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filter, setFilter] = useState<ClientFilter>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, filter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const clientsData = await DataService.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await DataService.searchClients(filter);
      setFilteredClients(filtered);
    } catch (error) {
      console.error('Error filtering clients:', error);
      setFilteredClients([]);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await DataService.deleteClient(clientId);
        loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingClient(null);
    loadClients();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleSearch = (searchTerm: string) => {
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  const handleStatusFilter = (status: ClientStatus | '') => {
    setFilter(prev => ({ 
      ...prev, 
      status: status || undefined 
    }));
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: ClientStatus.ACTIVE, label: 'Active' },
    { value: ClientStatus.VIP, label: 'VIP' },
    { value: ClientStatus.INACTIVE, label: 'Inactive' },
    { value: ClientStatus.SUSPENDED, label: 'Suspended' },
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
              onClick={handleAddClient}
              className="btn-primary"
            >
              Add Client
            </button>
          }
        />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search clients by name, email, or phone..."
                  onSearch={handleSearch}
                />
              </div>
              <FilterDropdown
                options={statusOptions}
                value={filter.status || ''}
                onChange={(value) => handleStatusFilter(value as ClientStatus | '')}
                placeholder="Filter by status"
              />
            </div>

            {/* Clients Grid */}
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {clients.length === 0 ? 'No clients yet' : 'No clients match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {clients.length === 0 
                    ? 'Get started by adding your first client.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {clients.length === 0 && (
                  <button
                    onClick={handleAddClient}
                    className="btn-primary"
                  >
                    Add Your First Client
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={handleEditClient}
                    onDelete={handleDeleteClient}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <ClientForm
                client={editingClient}
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