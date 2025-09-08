'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Client, ClientService, Service, CreateInvoiceData, ValidationError, InvoiceStatus, PaymentMethod } from '@/types';
import { calculateSubtotal, calculateInvoiceTotal, getCurrentISOString } from '@/utils';

interface InvoiceFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  preSelectedClientId?: string;
}

export default function InvoiceForm({ onSubmit, onCancel, preSelectedClientId }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateInvoiceData>({
    clientId: '',
    clientServiceIds: [],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: InvoiceStatus.DRAFT,
    subtotal: 0,
    tax: 8.5, // Default tax percentage
    discount: 0,
    total: 0,
    paidAmount: 0,
    paymentMethod: undefined,
    paymentDate: undefined,
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    if (preSelectedClientId) {
      setSelectedClientId(preSelectedClientId);
    }
  }, [preSelectedClientId]);

  useEffect(() => {
    if (selectedClientId) {
      const loadClientServices = async () => {
        try {
          const clientServiceList = await DataService.getClientServicesByClient(selectedClientId);
          // Allow invoicing any assigned service regardless of status
          setClientServices(clientServiceList);
          setFormData(prev => ({ ...prev, clientId: selectedClientId }));
        } catch (error) {
          console.error('Error loading client services:', error);
        }
      };
      loadClientServices();
    }
  }, [selectedClientId]);

  useEffect(() => {
    calculateTotals();
  }, [selectedServiceIds, formData.tax, formData.discount]);

  const loadData = async () => {
    try {
      const clientsData = await DataService.getClients();
      const servicesData = await DataService.getServices();
      setClients(clientsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateTotals = () => {
    const selectedServices = clientServices.filter(cs => selectedServiceIds.includes(cs.id));
    const subtotal = selectedServices.reduce((total, cs) => {
      const service = services.find(s => s.id === cs.serviceId);
      const price = cs.customPrice || service?.basePrice || 0;
      return total + price;
    }, 0);

    const total = calculateInvoiceTotal(subtotal, formData.tax, formData.discount);

    setFormData(prev => ({
      ...prev,
      clientServiceIds: selectedServiceIds,
      subtotal,
      total,
    }));
  };

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
        [name]: parseFloat(value) || 0,
      }));
    } else if (type === 'date') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServiceIds(prev => [...prev, serviceId]);
    } else {
      setSelectedServiceIds(prev => prev.filter(id => id !== serviceId));
    }
  };

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!formData.clientId) {
      validationErrors.push({ field: 'clientId', message: 'Client is required' });
    }

    if (formData.clientServiceIds.length === 0) {
      validationErrors.push({ field: 'services', message: 'At least one service must be selected' });
    }

    if (!formData.issueDate) {
      validationErrors.push({ field: 'issueDate', message: 'Issue date is required' });
    }

    if (!formData.dueDate) {
      validationErrors.push({ field: 'dueDate', message: 'Due date is required' });
    }

    if (formData.dueDate && formData.issueDate && formData.dueDate < formData.issueDate) {
      validationErrors.push({ field: 'dueDate', message: 'Due date must be after issue date' });
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await DataService.createInvoice(formData);
      onSubmit();
    } catch (error) {
      console.error('Error creating invoice:', error);
      setErrors([{ field: 'general', message: 'Failed to create invoice. Please try again.' }]);
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

      {/* Client Selection */}
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
      </div>

      {/* Service Selection */}
      {selectedClientId && clientServices.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Services *
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {clientServices.map((cs) => {
              const service = services.find(s => s.id === cs.serviceId);
              const price = cs.customPrice || service?.basePrice || 0;
              
              return (
                <div key={cs.id} className="flex items-center justify-between">
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(cs.id)}
                      onChange={(e) => handleServiceSelection(cs.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{service?.name}</span>
                      <div className="text-xs text-gray-500">
                        Status: {cs.status.charAt(0).toUpperCase() + cs.status.slice(1)} • Scheduled: {cs.startDate ? new Date(cs.startDate).toLocaleDateString() : 'Not scheduled'}
                      </div>
                    </div>
                  </label>
                  <span className="text-sm font-semibold">${price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          {getFieldError('services') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('services')}</p>
          )}
        </div>
      )}

      {selectedClientId && clientServices.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-700 text-sm">
          No assigned services found for this client. Please assign services to this client first before creating an invoice.
        </div>
      )}

      {/* Invoice Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('issueDate') ? 'input-error' : ''}`}
          />
          {getFieldError('issueDate') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('issueDate')}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date *
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('dueDate') ? 'input-error' : ''}`}
          />
          {getFieldError('dueDate') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('dueDate')}</p>
          )}
        </div>
      </div>

      {/* Tax and Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-1">
            Tax (%)
          </label>
          <input
            type="number"
            id="tax"
            name="tax"
            min="0"
            max="100"
            step="0.1"
            value={formData.tax}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            id="discount"
            name="discount"
            min="0"
            max="100"
            step="0.1"
            value={formData.discount}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>
      </div>

      {/* Invoice Summary */}
      {selectedServiceIds.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Invoice Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${formData.subtotal.toFixed(2)}</span>
            </div>
            {formData.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax ({formData.tax}%):</span>
                <span>${((formData.subtotal * formData.tax) / 100).toFixed(2)}</span>
              </div>
            )}
            {formData.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({formData.discount}%):</span>
                <span>-${((formData.subtotal * formData.discount) / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${formData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

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
          placeholder="Add any notes for this invoice..."
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
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}