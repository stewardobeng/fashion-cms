'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { type AppSettings, UpdateAppSettingsData, Currency, ValidationError, getCurrencySymbol } from '@/types';

interface AppSettingsProps {
  onDataChange?: () => void;
}

export default function AppSettings({ onDataChange }: AppSettingsProps) {
  const { settings, updateSettings, isLoading } = useSettings();
  const [formData, setFormData] = useState<UpdateAppSettingsData>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('business');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        businessPhone: settings.businessPhone,
        businessEmail: settings.businessEmail,
        businessWebsite: settings.businessWebsite,
        currency: settings.currency,
        timezone: settings.timezone,
        taxRate: settings.taxRate,
        invoiceSettings: settings.invoiceSettings,
        emailSettings: settings.emailSettings,
        backupSettings: settings.backupSettings,
      });
    }
  }, [settings]);

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
      
      // Handle nested objects
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof UpdateAppSettingsData] as any),
            [childKey]: checked,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else if (type === 'number') {
      // Handle nested objects
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof UpdateAppSettingsData] as any),
            [childKey]: parseFloat(value) || 0,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: parseFloat(value) || 0,
        }));
      }
    } else {
      // Handle nested objects
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof UpdateAppSettingsData] as any),
            [childKey]: value,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    
    setHasChanges(true);
  };

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!formData.businessName?.trim()) {
      validationErrors.push({ field: 'businessName', message: 'Business name is required' });
    }

    if (!formData.businessEmail?.trim()) {
      validationErrors.push({ field: 'businessEmail', message: 'Business email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      validationErrors.push({ field: 'businessEmail', message: 'Please enter a valid email address' });
    }

    if (!formData.businessPhone?.trim()) {
      validationErrors.push({ field: 'businessPhone', message: 'Business phone is required' });
    }

    if (formData.taxRate !== undefined && (formData.taxRate < 0 || formData.taxRate > 100)) {
      validationErrors.push({ field: 'taxRate', message: 'Tax rate must be between 0 and 100' });
    }

    if (formData.invoiceSettings?.dueInDays !== undefined && formData.invoiceSettings.dueInDays < 1) {
      validationErrors.push({ field: 'invoiceSettings.dueInDays', message: 'Due days must be at least 1' });
    }

    if (formData.invoiceSettings?.nextNumber !== undefined && formData.invoiceSettings.nextNumber < 1) {
      validationErrors.push({ field: 'invoiceSettings.nextNumber', message: 'Next invoice number must be at least 1' });
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
      await updateSettings(formData);
      setHasChanges(false);
      setErrors([]);
      onDataChange?.();
    } catch (error) {
      console.error('Error updating app settings:', error);
      setErrors([{ field: 'general', message: 'Failed to update settings. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        businessPhone: settings.businessPhone,
        businessEmail: settings.businessEmail,
        businessWebsite: settings.businessWebsite,
        currency: settings.currency,
        timezone: settings.timezone,
        taxRate: settings.taxRate,
        invoiceSettings: settings.invoiceSettings,
        emailSettings: settings.emailSettings,
        backupSettings: settings.backupSettings,
      });
      setHasChanges(false);
      setErrors([]);
    }
  };

  const sections = [
    { id: 'business', label: 'Business Info', icon: '🏢' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'invoice', label: 'Invoice Settings', icon: '📄' },
    { id: 'email', label: 'Email Settings', icon: '📧' },
    { id: 'backup', label: 'Backup Settings', icon: '💾' },
  ];

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">App Settings</h2>
          <p className="text-gray-600 mt-1">Configure application settings and preferences</p>
        </div>
        {hasChanges && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-amber-600">Unsaved changes</span>
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          </div>
        )}
      </div>

      {/* General error message */}
      {getFieldError('general') && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
          {getFieldError('general')}
        </div>
      )}

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 pr-6">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                  activeSection === section.id
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            {activeSection === 'business' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName || ''}
                        onChange={handleInputChange}
                        className={`input-field ${getFieldError('businessName') ? 'input-error' : ''}`}
                        placeholder="Enter business name"
                      />
                      {getFieldError('businessName') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('businessName')}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          id="businessEmail"
                          name="businessEmail"
                          value={formData.businessEmail || ''}
                          onChange={handleInputChange}
                          className={`input-field ${getFieldError('businessEmail') ? 'input-error' : ''}`}
                          placeholder="business@example.com"
                        />
                        {getFieldError('businessEmail') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('businessEmail')}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          Business Phone *
                        </label>
                        <input
                          type="tel"
                          id="businessPhone"
                          name="businessPhone"
                          value={formData.businessPhone || ''}
                          onChange={handleInputChange}
                          className={`input-field ${getFieldError('businessPhone') ? 'input-error' : ''}`}
                          placeholder="+1-555-123-4567"
                        />
                        {getFieldError('businessPhone') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('businessPhone')}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        id="businessWebsite"
                        name="businessWebsite"
                        value={formData.businessWebsite || ''}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="https://www.example.com"
                      />
                    </div>

                    {/* Business Address */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Business Address</h4>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="businessAddress.street" className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="businessAddress.street"
                            name="businessAddress.street"
                            value={formData.businessAddress?.street || ''}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="123 Main Street"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="businessAddress.city" className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              id="businessAddress.city"
                              name="businessAddress.city"
                              value={formData.businessAddress?.city || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="New York"
                            />
                          </div>

                          <div>
                            <label htmlFor="businessAddress.state" className="block text-sm font-medium text-gray-700 mb-1">
                              State/Province
                            </label>
                            <input
                              type="text"
                              id="businessAddress.state"
                              name="businessAddress.state"
                              value={formData.businessAddress?.state || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="NY"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="businessAddress.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP/Postal Code
                            </label>
                            <input
                              type="text"
                              id="businessAddress.zipCode"
                              name="businessAddress.zipCode"
                              value={formData.businessAddress?.zipCode || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="10001"
                            />
                          </div>

                          <div>
                            <label htmlFor="businessAddress.country" className="block text-sm font-medium text-gray-700 mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              id="businessAddress.country"
                              name="businessAddress.country"
                              value={formData.businessAddress?.country || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="USA"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Settings */}
            {activeSection === 'financial' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                          Default Currency
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency || Currency.USD}
                          onChange={handleInputChange}
                          className="input-field"
                        >
                          {Object.values(Currency).map((currency) => (
                            <option key={currency} value={currency}>
                              {currency} ({getCurrencySymbol(currency)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
                          Default Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          id="taxRate"
                          name="taxRate"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.taxRate || 0}
                          onChange={handleInputChange}
                          className={`input-field ${getFieldError('taxRate') ? 'input-error' : ''}`}
                          placeholder="8.5"
                        />
                        {getFieldError('taxRate') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('taxRate')}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        name="timezone"
                        value={formData.timezone || 'America/New_York'}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                        <option value="Europe/Paris">Central European Time (CET)</option>
                        <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                        <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Settings */}
            {activeSection === 'invoice' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="invoiceSettings.prefix" className="block text-sm font-medium text-gray-700 mb-1">
                          Invoice Prefix
                        </label>
                        <input
                          type="text"
                          id="invoiceSettings.prefix"
                          name="invoiceSettings.prefix"
                          value={formData.invoiceSettings?.prefix || ''}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="INV"
                        />
                        <p className="mt-1 text-xs text-gray-500">Prefix for invoice numbers (e.g., INV-001)</p>
                      </div>

                      <div>
                        <label htmlFor="invoiceSettings.nextNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Next Invoice Number
                        </label>
                        <input
                          type="number"
                          id="invoiceSettings.nextNumber"
                          name="invoiceSettings.nextNumber"
                          min="1"
                          value={formData.invoiceSettings?.nextNumber || 1001}
                          onChange={handleInputChange}
                          className={`input-field ${getFieldError('invoiceSettings.nextNumber') ? 'input-error' : ''}`}
                          placeholder="1001"
                        />
                        {getFieldError('invoiceSettings.nextNumber') && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('invoiceSettings.nextNumber')}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="invoiceSettings.dueInDays" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Due Days
                      </label>
                      <input
                        type="number"
                        id="invoiceSettings.dueInDays"
                        name="invoiceSettings.dueInDays"
                        min="1"
                        value={formData.invoiceSettings?.dueInDays || 30}
                        onChange={handleInputChange}
                        className={`input-field ${getFieldError('invoiceSettings.dueInDays') ? 'input-error' : ''}`}
                        placeholder="30"
                      />
                      {getFieldError('invoiceSettings.dueInDays') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('invoiceSettings.dueInDays')}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Number of days from issue date to due date</p>
                    </div>

                    <div>
                      <label htmlFor="invoiceSettings.footerText" className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Footer Text
                      </label>
                      <textarea
                        id="invoiceSettings.footerText"
                        name="invoiceSettings.footerText"
                        rows={3}
                        value={formData.invoiceSettings?.footerText || ''}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Thank you for your business!"
                      />
                      <p className="mt-1 text-xs text-gray-500">Text that appears at the bottom of invoices</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeSection === 'email' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="emailSettings.fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          From Email Address
                        </label>
                        <input
                          type="email"
                          id="emailSettings.fromEmail"
                          name="emailSettings.fromEmail"
                          value={formData.emailSettings?.fromEmail || ''}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="noreply@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="emailSettings.fromName" className="block text-sm font-medium text-gray-700 mb-1">
                          From Name
                        </label>
                        <input
                          type="text"
                          id="emailSettings.fromName"
                          name="emailSettings.fromName"
                          value={formData.emailSettings?.fromName || ''}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Fashion CMS"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">SMTP Configuration (Optional)</h4>
                      <p className="text-xs text-gray-500 mb-4">Configure SMTP settings for automated email sending</p>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="emailSettings.smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Host
                            </label>
                            <input
                              type="text"
                              id="emailSettings.smtpHost"
                              name="emailSettings.smtpHost"
                              value={formData.emailSettings?.smtpHost || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="smtp.gmail.com"
                            />
                          </div>

                          <div>
                            <label htmlFor="emailSettings.smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Port
                            </label>
                            <input
                              type="number"
                              id="emailSettings.smtpPort"
                              name="emailSettings.smtpPort"
                              value={formData.emailSettings?.smtpPort || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="587"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="emailSettings.smtpUser" className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Username
                            </label>
                            <input
                              type="text"
                              id="emailSettings.smtpUser"
                              name="emailSettings.smtpUser"
                              value={formData.emailSettings?.smtpUser || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="username@gmail.com"
                            />
                          </div>

                          <div>
                            <label htmlFor="emailSettings.smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Password
                            </label>
                            <input
                              type="password"
                              id="emailSettings.smtpPassword"
                              name="emailSettings.smtpPassword"
                              value={formData.emailSettings?.smtpPassword || ''}
                              onChange={handleInputChange}
                              className="input-field"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeSection === 'backup' && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          id="backupSettings.autoBackup"
                          name="backupSettings.autoBackup"
                          type="checkbox"
                          checked={formData.backupSettings?.autoBackup || false}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="backupSettings.autoBackup" className="text-sm font-medium text-gray-700">
                          Enable Automatic Backups
                        </label>
                        <p className="text-xs text-gray-500">Automatically create data backups at specified intervals</p>
                      </div>
                    </div>

                    {formData.backupSettings?.autoBackup && (
                      <div className="pl-7 space-y-4">
                        <div>
                          <label htmlFor="backupSettings.backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                            Backup Frequency
                          </label>
                          <select
                            id="backupSettings.backupFrequency"
                            name="backupSettings.backupFrequency"
                            value={formData.backupSettings?.backupFrequency || 'weekly'}
                            onChange={handleInputChange}
                            className="input-field"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="backupSettings.retentionDays" className="block text-sm font-medium text-gray-700 mb-1">
                            Retention Period (Days)
                          </label>
                          <input
                            type="number"
                            id="backupSettings.retentionDays"
                            name="backupSettings.retentionDays"
                            min="1"
                            value={formData.backupSettings?.retentionDays || 30}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="30"
                          />
                          <p className="mt-1 text-xs text-gray-500">Number of days to keep backup files</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
                disabled={isSubmitting || !hasChanges}
              >
                Reset Changes
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !hasChanges}
              >
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}