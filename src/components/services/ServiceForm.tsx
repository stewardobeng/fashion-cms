'use client';

import { useState } from 'react';
import { DataService } from '@/lib/data-service';
import { Service, CreateServiceData, ServiceCategory, ValidationError } from '@/types';
import { validateServiceData, parseRequirements, stringifyRequirements } from '@/utils';

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<CreateServiceData>({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || ServiceCategory.DESIGN,
    basePrice: service?.basePrice || 0,
    duration: service?.duration || 60,
    isActive: service?.isActive ?? true,
    requirements: service?.requirements || '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementInput, setRequirementInput] = useState('');
  
  // Parse requirements for display
  const requirementsArray = parseRequirements(formData.requirements);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      const currentRequirements = parseRequirements(formData.requirements);
      const updatedRequirements = [...currentRequirements, requirementInput.trim()];
      setFormData(prev => ({
        ...prev,
        requirements: stringifyRequirements(updatedRequirements),
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    const currentRequirements = parseRequirements(formData.requirements);
    const updatedRequirements = currentRequirements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      requirements: stringifyRequirements(updatedRequirements),
    }));
  };

  const handleRequirementKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validationErrors = validateServiceData(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (service) {
        // Update existing service
        await DataService.updateService(service.id, formData);
      } else {
        // Create new service
        await DataService.createService(formData);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving service:', error);
      setErrors([{ field: 'general', message: 'Failed to save service. Please try again.' }]);
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

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Service Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('name') ? 'input-error' : ''}`}
            placeholder="Enter service name"
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value={ServiceCategory.DESIGN}>Design</option>
            <option value={ServiceCategory.TAILORING}>Tailoring</option>
            <option value={ServiceCategory.ALTERATIONS}>Alterations</option>
            <option value={ServiceCategory.CONSULTATION}>Consultation</option>
            <option value={ServiceCategory.FITTING}>Fitting</option>
            <option value={ServiceCategory.STYLING}>Styling</option>
            <option value={ServiceCategory.CUSTOM_COUTURE}>Custom Couture</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Service is active
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className={`input-field ${getFieldError('description') ? 'input-error' : ''}`}
          placeholder="Describe the service in detail..."
        />
        {getFieldError('description') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
        )}
      </div>

      {/* Pricing and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Base Price ($) *
          </label>
          <input
            type="number"
            id="basePrice"
            name="basePrice"
            min="0"
            step="0.01"
            value={formData.basePrice}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('basePrice') ? 'input-error' : ''}`}
            placeholder="0.00"
          />
          {getFieldError('basePrice') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('basePrice')}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="1"
            value={formData.duration}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('duration') ? 'input-error' : ''}`}
            placeholder="60"
          />
          {getFieldError('duration') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('duration')}</p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirements
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyPress={handleRequirementKeyPress}
              className="input-field flex-1"
              placeholder="Add a requirement..."
            />
            <button
              type="button"
              onClick={handleAddRequirement}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
          
          {requirementsArray.length > 0 && (
            <div className="space-y-1">
              {requirementsArray.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{requirement}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (service ? 'Update Service' : 'Add Service')}
        </button>
      </div>
    </form>
  );
}