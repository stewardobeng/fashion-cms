'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Service, ServiceFilter, ServiceCategory } from '@/types';
import { formatCurrency } from '@/utils';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ServiceForm from '@/components/services/ServiceForm';
import ServiceCard from '@/components/services/ServiceCard';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filter, setFilter] = useState<ServiceFilter>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, filter]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const servicesData = await DataService.getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await DataService.searchServices(filter);
      setFilteredServices(filtered);
    } catch (error) {
      console.error('Error filtering services:', error);
      setFilteredServices([]);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await DataService.deleteService(serviceId);
        loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingService(null);
    loadServices();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const handleSearch = (searchTerm: string) => {
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  const handleCategoryFilter = (category: ServiceCategory | '') => {
    setFilter(prev => ({ 
      ...prev, 
      category: category || undefined 
    }));
  };

  const handleStatusFilter = (isActive: string) => {
    setFilter(prev => ({ 
      ...prev, 
      isActive: isActive === '' ? undefined : isActive === 'true'
    }));
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: ServiceCategory.DESIGN, label: 'Design' },
    { value: ServiceCategory.TAILORING, label: 'Tailoring' },
    { value: ServiceCategory.ALTERATIONS, label: 'Alterations' },
    { value: ServiceCategory.CONSULTATION, label: 'Consultation' },
    { value: ServiceCategory.FITTING, label: 'Fitting' },
    { value: ServiceCategory.STYLING, label: 'Styling' },
    { value: ServiceCategory.CUSTOM_COUTURE, label: 'Custom Couture' },
  ];

  const statusOptions = [
    { value: '', label: 'All Services' },
    { value: 'true', label: 'Active Only' },
    { value: 'false', label: 'Inactive Only' },
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
              onClick={handleAddService}
              className="btn-primary"
            >
              Add Service
            </button>
          }
        />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search services by name, description, or category..."
                  onSearch={handleSearch}
                />
              </div>
              <FilterDropdown
                options={categoryOptions}
                value={filter.category || ''}
                onChange={(value) => handleCategoryFilter(value as ServiceCategory | '')}
                placeholder="Filter by category"
              />
              <FilterDropdown
                options={statusOptions}
                value={filter.isActive === undefined ? '' : filter.isActive.toString()}
                onChange={handleStatusFilter}
                placeholder="Filter by status"
              />
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✂️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {services.length === 0 ? 'No services yet' : 'No services match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {services.length === 0 
                    ? 'Get started by adding your first service.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {services.length === 0 && (
                  <button
                    onClick={handleAddService}
                    className="btn-primary"
                  >
                    Add Your First Service
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <ServiceForm
                service={editingService}
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