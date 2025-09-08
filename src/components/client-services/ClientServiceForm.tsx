'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Client, Service, ClientService, CreateClientServiceData, ServiceStatus, ValidationError } from '@/types';
import { getCurrentISOString } from '@/utils';

interface ClientServiceFormProps {
  clientService?: ClientService | null;
  onSubmit: () => void;
  onCancel: () => void;
  preSelectedClientId?: string;
}

export default function ClientServiceForm({ clientService, onSubmit, onCancel, preSelectedClientId }: ClientServiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(clientService?.clientId || preSelectedClientId || '');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(clientService ? [clientService.serviceId] : []);
  const [formData, setFormData] = useState<Omit<CreateClientServiceData, 'clientId' | 'serviceId'>>({
    scheduledDate: clientService?.scheduledDate || '',
    status: clientService?.status || ServiceStatus.SCHEDULED,
    assignedStaff: clientService?.assignedStaff || '',
    notes: clientService?.notes || '',
    customPrice: clientService?.customPrice || undefined,
    completedDate: clientService?.completedDate || undefined,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load clients and services
    const loadData = async () => {
      try {
        const clientsData = await DataService.getClients();
        const servicesData = await DataService.getServices();
        setClients(clientsData);
        setServices(servicesData.filter(s => s.isActive));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined,
      }));
    } else if (type === 'datetime-local') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? new Date(value).toISOString() : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!selectedClientId) {
      validationErrors.push({ field: 'clientId', message: 'Client is required' });
    }

    if (selectedServiceIds.length === 0) {
      validationErrors.push({ field: 'serviceIds', message: 'At least one service is required' });
    }

    if (!formData.scheduledDate) {
      validationErrors.push({ field: 'scheduledDate', message: 'Scheduled date is required' });
    }

    if (formData.status === ServiceStatus.COMPLETED && !formData.completedDate) {
      validationErrors.push({ field: 'completedDate', message: 'Completed date is required when status is completed' });
    }

    if (formData.customPrice && formData.customPrice <= 0) {
      validationErrors.push({ field: 'customPrice', message: 'Custom price must be greater than 0' });
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Auto-set completed date if status is completed and no date is set
      const baseData = { ...formData };
      if (baseData.status === ServiceStatus.COMPLETED && !baseData.completedDate) {
        baseData.completedDate = getCurrentISOString();
      }

      if (clientService) {
        // Update existing client service
        const submitData = {
          ...baseData,
          clientId: selectedClientId,
          serviceId: selectedServiceIds[0], // For editing, we only update the first service
        };
        await DataService.updateClientService(clientService.id, submitData);
      } else {
        // Create multiple new client services (one for each selected service)
        for (const serviceId of selectedServiceIds) {
          const submitData = {
            ...baseData,
            clientId: selectedClientId,
            serviceId,
          };
          await DataService.createClientService(submitData);
        }
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving client service:', error);
      setErrors([{ field: 'general', message: 'Failed to save service assignment. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error message */}
      {getFieldError('general') && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
          {getFieldError('general')}
        </div>
      )}

      {/* Client and Service Selection */}
      <div className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
            Client *
          </label>
          <select
            id="clientId"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={`input-field ${getFieldError('clientId') ? 'input-error' : ''}`}
            disabled={!!preSelectedClientId}
          >
            <option value="">Select a client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName} - {client.email}
              </option>
            ))}
          </select>
          {getFieldError('clientId') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('clientId')}</p>
          )}
          {preSelectedClientId && (
            <p className="mt-1 text-sm text-blue-600">Client pre-selected for this assignment</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services * {!clientService && <span className="text-xs text-gray-500">(Select multiple services)</span>}
          </label>
          {clientService ? (
            // For editing, show single service selection
            <select
              value={selectedServiceIds[0] || ''}
              onChange={(e) => setSelectedServiceIds(e.target.value ? [e.target.value] : [])}
              className={`input-field ${getFieldError('serviceIds') ? 'input-error' : ''}`}
            >
              <option value="">Select a service...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.basePrice}
                </option>
              ))}
            </select>
          ) : (
            // For creating new, show multiple service selection
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-gray-500 text-sm">No active services available</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServiceIds(prev => [...prev, service.id]);
                          } else {
                            setSelectedServiceIds(prev => prev.filter(id => id !== service.id));
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          <span className="text-sm font-semibold text-gray-700">${service.basePrice}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {service.duration} min
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{service.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          {getFieldError('serviceIds') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('serviceIds')}</p>
          )}
        </div>
      </div>

      {/* Selected Services Summary */}
      {selectedServiceIds.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">
            Selected Services ({selectedServiceIds.length})
          </h4>
          <div className="space-y-3">
            {selectedServiceIds.map(serviceId => {
              const service = services.find(s => s.id === serviceId);
              if (!service) return null;
              
              return (
                <div key={serviceId} className="bg-white p-3 rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{service.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Category: {service.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span>Duration: {service.duration} min</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900">${service.basePrice}</div>
                      <div className="text-xs text-gray-500">Base Price</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {selectedServiceIds.length > 1 && (
              <div className="bg-primary-50 p-3 rounded border border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary-900">Total Base Price:</span>
                  <span className="font-bold text-primary-900">
                    ${selectedServiceIds.reduce((total, serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return total + (service?.basePrice || 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-primary-700 mt-1">
                  Note: Each service will be scheduled separately and can have individual custom pricing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Date & Time *
          </label>
          <input
            type="datetime-local"
            id="scheduledDate"
            name="scheduledDate"
            value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ''}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('scheduledDate') ? 'input-error' : ''}`}
          />
          {getFieldError('scheduledDate') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('scheduledDate')}</p>
          )}
        </div>

        <div>
          <label htmlFor="assignedStaff" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Staff
          </label>
          <input
            type="text"
            id="assignedStaff"
            name="assignedStaff"
            value={formData.assignedStaff}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter staff member name"
          />
        </div>
      </div>

      {/* Status and Completion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value={ServiceStatus.SCHEDULED}>Scheduled</option>
            <option value={ServiceStatus.IN_PROGRESS}>In Progress</option>
            <option value={ServiceStatus.COMPLETED}>Completed</option>
            <option value={ServiceStatus.CANCELLED}>Cancelled</option>
            <option value={ServiceStatus.NO_SHOW}>No Show</option>
            <option value={ServiceStatus.RESCHEDULED}>Rescheduled</option>
          </select>
        </div>

        {formData.status === ServiceStatus.COMPLETED && (
          <div>
            <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700 mb-1">
              Completed Date & Time
            </label>
            <input
              type="datetime-local"
              id="completedDate"
              name="completedDate"
              value={formData.completedDate ? new Date(formData.completedDate).toISOString().slice(0, 16) : ''}
              onChange={handleInputChange}
              className={`input-field ${getFieldError('completedDate') ? 'input-error' : ''}`}
            />
            {getFieldError('completedDate') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('completedDate')}</p>
            )}
          </div>
        )}
      </div>

      {/* Custom Price */}
      <div>
        <label htmlFor="customPrice" className="block text-sm font-medium text-gray-700 mb-1">
          Custom Price {selectedServiceIds.length > 1 && <span className="text-xs text-gray-500">(Applied to each service)</span>}
        </label>
        <input
          type="number"
          id="customPrice"
          name="customPrice"
          min="0"
          step="0.01"
          value={formData.customPrice || ''}
          onChange={handleInputChange}
          className={`input-field ${getFieldError('customPrice') ? 'input-error' : ''}`}
          placeholder={selectedServiceIds.length === 1 ? `Base price: $${services.find(s => s.id === selectedServiceIds[0])?.basePrice || 0}` : 'Enter custom price for all services'}
        />
        {selectedServiceIds.length > 1 && (
          <p className="mt-1 text-xs text-gray-500">
            If set, this price will override the base price for each selected service.
          </p>
        )}
        {getFieldError('customPrice') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('customPrice')}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          className="input-field"
          placeholder="Add any notes about this service assignment..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || selectedServiceIds.length === 0}
        >
          {isSubmitting ? 'Saving...' : (
            clientService ? 'Update Assignment' : (
              selectedServiceIds.length > 1 
                ? `Assign ${selectedServiceIds.length} Services` 
                : 'Assign Service'
            )
          )}
        </button>
      </div>
    </form>
  );
}