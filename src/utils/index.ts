import { v4 as uuidv4 } from 'uuid';
import {
  Client,
  Service,
  ClientService,
  Invoice,
  CreateClientData,
  CreateServiceData,
  CreateClientServiceData,
  CreateInvoiceData,
  ValidationError,
  InvoiceStatus,
  ClientStatus,
  Currency,
  getCurrencySymbol
} from '@/types';

// ID Generation
export const generateId = (): string => uuidv4();

// Date Utilities
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'Not specified';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'Not specified';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getCurrentISOString = (): string => new Date().toISOString();

// Invoice Number Generation
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
};

// Currency Formatting
export const formatCurrency = (amount: number, currency: Currency = Currency.USD): string => {
  const symbol = getCurrencySymbol(currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Legacy function for backward compatibility
export const formatCurrencyUSD = (amount: number): string => {
  return formatCurrency(amount, Currency.USD);
};

// Data Creation Helpers
export const createClient = (data: CreateClientData): Client => ({
  ...data,
  id: generateId(),
  createdAt: getCurrentISOString(),
  updatedAt: getCurrentISOString(),
  // totalSpent: calculated dynamically from payments relation
});

export const createService = (data: CreateServiceData): Service => ({
  ...data,
  id: generateId(),
  createdAt: getCurrentISOString(),
  updatedAt: getCurrentISOString(),
});

export const createClientService = (data: CreateClientServiceData): ClientService => ({
  ...data,
  id: generateId(),
  createdAt: getCurrentISOString(),
  updatedAt: getCurrentISOString(),
});

export const createInvoice = (data: CreateInvoiceData): Invoice => ({
  ...data,
  id: generateId(),
  invoiceNumber: generateInvoiceNumber(),
  createdAt: getCurrentISOString(),
  updatedAt: getCurrentISOString(),
});

// Validation Functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateClientData = (data: CreateClientData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(data.firstName)) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!validateRequired(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!validateRequired(data.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!validateRequired(data.phone)) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone number format' });
  }

  if (!validateRequired(data.address.street)) {
    errors.push({ field: 'address.street', message: 'Street address is required' });
  }

  if (!validateRequired(data.address.city)) {
    errors.push({ field: 'address.city', message: 'City is required' });
  }

  if (!validateRequired(data.address.state)) {
    errors.push({ field: 'address.state', message: 'State is required' });
  }

  if (!validateRequired(data.address.zipCode)) {
    errors.push({ field: 'address.zipCode', message: 'ZIP code is required' });
  }

  if (!validateRequired(data.dateJoined)) {
    errors.push({ field: 'dateJoined', message: 'Date joined is required' });
  }

  return errors;
};

export const validateServiceData = (data: CreateServiceData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(data.name)) {
    errors.push({ field: 'name', message: 'Service name is required' });
  }

  if (!validateRequired(data.description)) {
    errors.push({ field: 'description', message: 'Service description is required' });
  }

  if (!data.basePrice || data.basePrice <= 0) {
    errors.push({ field: 'basePrice', message: 'Base price must be greater than 0' });
  }

  if (!data.duration || data.duration <= 0) {
    errors.push({ field: 'duration', message: 'Duration must be greater than 0' });
  }

  return errors;
};

// Search and Filter Utilities
export const filterClients = (clients: Client[], searchTerm: string): Client[] => {
  if (!searchTerm.trim()) return clients;

  const term = searchTerm.toLowerCase();
  return clients.filter(client =>
    client.firstName.toLowerCase().includes(term) ||
    client.lastName.toLowerCase().includes(term) ||
    client.email.toLowerCase().includes(term) ||
    client.phone.includes(term)
  );
};

export const filterServices = (services: Service[], searchTerm: string): Service[] => {
  if (!searchTerm.trim()) return services;

  const term = searchTerm.toLowerCase();
  return services.filter(service =>
    service.name.toLowerCase().includes(term) ||
    service.description.toLowerCase().includes(term) ||
    service.category.toLowerCase().includes(term)
  );
};

// Client calculations
export const calculateTotalSpent = (payments: { amount: number }[]): number => {
  return payments.reduce((total, payment) => total + payment.amount, 0);
};

// Invoice Calculations
export const calculateInvoiceTotal = (
  subtotal: number,
  tax: number = 0,
  discount: number = 0
): number => {
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  return Math.max(0, subtotal + taxAmount - discountAmount);
};

export const calculateSubtotal = (clientServices: ClientService[], services: Service[]): number => {
  return clientServices.reduce((total, cs) => {
    const service = services.find(s => s.id === cs.serviceId);
    const price = cs.customPrice || service?.basePrice || 0;
    return total + price;
  }, 0);
};

// Status Helpers
export const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  switch (status) {
    case InvoiceStatus.PAID:
      return 'text-green-600 bg-green-100';
    case InvoiceStatus.OVERDUE:
      return 'text-red-600 bg-red-100';
    case InvoiceStatus.SENT:
      return 'text-blue-600 bg-blue-100';
    case InvoiceStatus.PARTIALLY_PAID:
      return 'text-yellow-600 bg-yellow-100';
    case InvoiceStatus.DRAFT:
      return 'text-gray-600 bg-gray-100';
    case InvoiceStatus.CANCELLED:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getClientStatusColor = (status: ClientStatus): string => {
  switch (status) {
    case ClientStatus.ACTIVE:
      return 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
    case ClientStatus.VIP:
      return 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800';
    case ClientStatus.INACTIVE:
      return 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
    case ClientStatus.SUSPENDED:
      return 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800';
    default:
      return 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  }
};

// Local Storage Helpers
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage: ${error}`);
    return defaultValue;
  }
};

// Export all utilities
export * from '@/types';