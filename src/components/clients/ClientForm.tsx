'use client';

import { useState } from 'react';
import { DataService } from '@/lib/data-service';
import { 
  Client, 
  CreateClientData, 
  ClientStatus, 
  ValidationError,
  AgeBracket,
  SkinColor,
  UKSize,
  ColorShade,
  RefashioningType,
  EmbellishmentType,
  RefashioningPreferences,
  EmbellishmentPreferences,
  getAgeBracketDisplayName,
  getSkinColorDisplayName,
  getColorShadeDisplayName,
  getRefashioningTypeDisplayName,
  getEmbellishmentTypeDisplayName
} from '@/types';
import { validateClientData } from '@/utils';

interface ClientFormProps {
  client?: Client | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientData>({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: {
      street: client?.address.street || '',
      city: client?.address.city || '',
      state: client?.address.state || '',
      zipCode: client?.address.zipCode || '',
      country: client?.address.country || 'USA',
    },
    ageBracket: client?.ageBracket || undefined,
    dateJoined: client?.dateJoined || new Date().toISOString().split('T')[0],
    skinColor: client?.skinColor || undefined,
    ukSize: client?.ukSize || undefined,
    colorShades: client?.colorShades || [],
    refashioning: client?.refashioning || { selectedTypes: [], notes: '' },
    embellishments: client?.embellishments || { selectedTypes: [], notes: '' },
    notes: client?.notes || '',
    preferredContactMethod: client?.preferredContactMethod || 'email',
    status: client?.status || ClientStatus.ACTIVE,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleColorShadeChange = (color: ColorShade, checked: boolean) => {
    setFormData(prev => {
      const colorShades = prev.colorShades || [];
      if (checked) {
        return {
          ...prev,
          colorShades: [...colorShades, color],
        };
      } else {
        return {
          ...prev,
          colorShades: colorShades.filter(c => c !== color),
        };
      }
    });
  };

  const handleRefashioningChange = (type: RefashioningType, checked: boolean) => {
    setFormData(prev => {
      const refashioning = prev.refashioning || { selectedTypes: [], notes: '' };
      const selectedTypes = refashioning.selectedTypes || [];
      
      if (checked) {
        return {
          ...prev,
          refashioning: {
            ...refashioning,
            selectedTypes: [...selectedTypes, type],
          },
        };
      } else {
        return {
          ...prev,
          refashioning: {
            ...refashioning,
            selectedTypes: selectedTypes.filter(t => t !== type),
          },
        };
      }
    });
  };

  const handleEmbellishmentChange = (type: EmbellishmentType, checked: boolean) => {
    setFormData(prev => {
      const embellishments = prev.embellishments || { selectedTypes: [], notes: '' };
      const selectedTypes = embellishments.selectedTypes || [];
      
      if (checked) {
        return {
          ...prev,
          embellishments: {
            ...embellishments,
            selectedTypes: [...selectedTypes, type],
          },
        };
      } else {
        return {
          ...prev,
          embellishments: {
            ...embellishments,
            selectedTypes: selectedTypes.filter(t => t !== type),
          },
        };
      }
    });
  };

  const handleRefashioningNotesChange = (notes: string) => {
    setFormData(prev => ({
      ...prev,
      refashioning: {
        ...prev.refashioning!,
        notes,
      },
    }));
  };

  const handleEmbellishmentNotesChange = (notes: string) => {
    setFormData(prev => ({
      ...prev,
      embellishments: {
        ...prev.embellishments!,
        notes,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validationErrors = validateClientData(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (client) {
        // Update existing client
        await DataService.updateClient(client.id, formData);
      } else {
        // Create new client
        await DataService.createClient(formData);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving client:', error);
      setErrors([{ field: 'general', message: 'Failed to save client. Please try again.' }]);
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

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('firstName') ? 'input-error' : ''}`}
            placeholder="Enter first name"
          />
          {getFieldError('firstName') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('firstName')}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('lastName') ? 'input-error' : ''}`}
            placeholder="Enter last name"
          />
          {getFieldError('lastName') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('lastName')}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('email') ? 'input-error' : ''}`}
            placeholder="Enter email address"
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('phone') ? 'input-error' : ''}`}
            placeholder="Enter phone number"
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className={`input-field ${getFieldError('address.street') ? 'input-error' : ''}`}
              placeholder="Enter street address"
            />
            {getFieldError('address.street') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('address.street')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className={`input-field ${getFieldError('address.city') ? 'input-error' : ''}`}
                placeholder="Enter city"
              />
              {getFieldError('address.city') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.city')}</p>
              )}
            </div>

            <div>
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                className={`input-field ${getFieldError('address.state') ? 'input-error' : ''}`}
                placeholder="Enter state"
              />
              {getFieldError('address.state') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.state')}</p>
              )}
            </div>

            <div>
              <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                className={`input-field ${getFieldError('address.zipCode') ? 'input-error' : ''}`}
                placeholder="Enter ZIP code"
              />
              {getFieldError('address.zipCode') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.zipCode')}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter country"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="ageBracket" className="block text-sm font-medium text-gray-700 mb-1">
            Age Bracket
          </label>
          <select
            id="ageBracket"
            name="ageBracket"
            value={formData.ageBracket || ''}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Select age bracket</option>
            {Object.values(AgeBracket).map((bracket) => (
              <option key={bracket} value={bracket}>
                {getAgeBracketDisplayName(bracket)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700 mb-1">
            Date Joined *
          </label>
          <input
            type="date"
            id="dateJoined"
            name="dateJoined"
            value={formData.dateJoined}
            onChange={handleInputChange}
            className={`input-field ${getFieldError('dateJoined') ? 'input-error' : ''}`}
          />
          {getFieldError('dateJoined') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('dateJoined')}</p>
          )}
        </div>

        <div>
          <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Contact Method
          </label>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            value={formData.preferredContactMethod}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="text">Text Message</option>
          </select>
        </div>
      </div>

      {/* Client Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Client Preferences</h3>
        
        {/* Skin Color and UK Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="skinColor" className="block text-sm font-medium text-gray-700 mb-1">
              Skin Color
            </label>
            <select
              id="skinColor"
              name="skinColor"
              value={formData.skinColor || ''}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Select skin color</option>
              {Object.values(SkinColor).map((color) => (
                <option key={color} value={color}>
                  {getSkinColorDisplayName(color)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ukSize" className="block text-sm font-medium text-gray-700 mb-1">
              UK Size
            </label>
            <select
              id="ukSize"
              name="ukSize"
              value={formData.ukSize || ''}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Select UK size</option>
              {Object.values(UKSize).map((size) => (
                <option key={size} value={size}>
                  Size {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value={ClientStatus.ACTIVE}>Active</option>
              <option value={ClientStatus.VIP}>VIP</option>
              <option value={ClientStatus.INACTIVE}>Inactive</option>
              <option value={ClientStatus.SUSPENDED}>Suspended</option>
            </select>
          </div>
        </div>

        {/* Color Shades */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Shades (Select all that apply)
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.values(ColorShade).map((color) => (
              <label key={color} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.colorShades?.includes(color) || false}
                  onChange={(e) => handleColorShadeChange(color, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {getColorShadeDisplayName(color)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Refashioning Preferences */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refashioning Preferences
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {Object.values(RefashioningType).map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.refashioning?.selectedTypes?.includes(type) || false}
                  onChange={(e) => handleRefashioningChange(type, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {getRefashioningTypeDisplayName(type)}
                </span>
              </label>
            ))}
          </div>
          <textarea
            rows={2}
            value={formData.refashioning?.notes || ''}
            onChange={(e) => handleRefashioningNotesChange(e.target.value)}
            className="input-field"
            placeholder="Additional refashioning notes..."
          />
        </div>

        {/* Embellishments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Embellishments
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            {Object.values(EmbellishmentType).map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.embellishments?.selectedTypes?.includes(type) || false}
                  onChange={(e) => handleEmbellishmentChange(type, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {getEmbellishmentTypeDisplayName(type)}
                </span>
              </label>
            ))}
          </div>
          <textarea
            rows={2}
            value={formData.embellishments?.notes || ''}
            onChange={(e) => handleEmbellishmentNotesChange(e.target.value)}
            className="input-field"
            placeholder="Additional embellishment notes..."
          />
        </div>
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
          placeholder="Add any additional notes about this client..."
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
        </button>
      </div>
    </form>
  );
}