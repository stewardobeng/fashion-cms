'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Staff, CreateStaffData, StaffRole, Permission, ValidationError, getRolePermissions } from '@/types';
import { formatDate, getCurrentISOString } from '@/utils';

interface StaffFormProps {
  staff?: Staff | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function StaffForm({ staff, onSubmit, onCancel }: StaffFormProps) {
  const [formData, setFormData] = useState<CreateStaffData>({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || StaffRole.STAFF,
    permissions: staff?.permissions || [],
    isActive: staff?.isActive ?? true,
    hireDate: staff?.hireDate || new Date().toISOString().split('T')[0],
    avatar: staff?.avatar || '',
    salary: staff?.salary || undefined,
    department: staff?.department || '',
    notes: staff?.notes || '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Auto-set permissions based on role
    if (!staff) {
      setFormData(prev => ({
        ...prev,
        permissions: getRolePermissions(prev.role)
      }));
    }
  }, [formData.role, staff]);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!formData.firstName.trim()) {
      validationErrors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!formData.lastName.trim()) {
      validationErrors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (!formData.email.trim()) {
      validationErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (!formData.phone.trim()) {
      validationErrors.push({ field: 'phone', message: 'Phone number is required' });
    }

    if (!formData.hireDate) {
      validationErrors.push({ field: 'hireDate', message: 'Hire date is required' });
    }

    // Note: Email duplication check temporarily disabled for async compatibility
    // TODO: Implement server-side validation

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
      if (staff) {
        await DataService.updateStaff(staff.id, formData);
      } else {
        await DataService.createStaff(formData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving staff member:', error);
      setErrors([{ field: 'general', message: 'Failed to save staff member. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: StaffRole.ADMIN, label: 'Administrator', description: 'Full system access' },
    { value: StaffRole.MANAGER, label: 'Manager', description: 'Management and reporting access' },
    { value: StaffRole.STAFF, label: 'Staff', description: 'Standard user access' },
    { value: StaffRole.ASSISTANT, label: 'Assistant', description: 'Limited read-only access' },
  ];

  const permissionGroups = [
    {
      title: 'Client Management',
      permissions: [Permission.MANAGE_CLIENTS, Permission.VIEW_CLIENTS]
    },
    {
      title: 'Service Management',
      permissions: [Permission.MANAGE_SERVICES, Permission.VIEW_SERVICES]
    },
    {
      title: 'Invoice & Payment',
      permissions: [Permission.MANAGE_INVOICES, Permission.VIEW_INVOICES, Permission.MANAGE_PAYMENTS, Permission.VIEW_PAYMENTS]
    },
    {
      title: 'Administration',
      permissions: [Permission.MANAGE_STAFF, Permission.VIEW_STAFF, Permission.MANAGE_SETTINGS, Permission.VIEW_REPORTS, Permission.BACKUP_RESTORE]
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error message */}
      {getFieldError('general') && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
          {getFieldError('general')}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
        </div>

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
              Email Address *
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
              Phone Number *
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

        {/* Role and Employment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="input-field"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {roleOptions.find(r => r.value === formData.role)?.description}
            </p>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Design, Tailoring"
            />
          </div>

          <div>
            <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date *
            </label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleInputChange}
              className={`input-field ${getFieldError('hireDate') ? 'input-error' : ''}`}
            />
            {getFieldError('hireDate') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('hireDate')}</p>
            )}
          </div>
        </div>

        {/* Salary and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Salary
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="salary"
                name="salary"
                min="0"
                step="1000"
                value={formData.salary || ''}
                onChange={handleInputChange}
                className="input-field pl-7"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Employee
              </label>
              <p className="text-xs text-gray-500">Inactive employees cannot access the system</p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Permissions</h4>
          <div className="space-y-4">
            {permissionGroups.map((group) => (
              <div key={group.title} className="border border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-800 mb-3">{group.title}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.permissions.map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        id={permission}
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={permission} className="ml-2 text-sm text-gray-700">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            placeholder="Add any additional notes about this staff member..."
          />
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
          {isSubmitting ? 'Saving...' : (staff ? 'Update Staff Member' : 'Add Staff Member')}
        </button>
      </div>
    </form>
  );
}