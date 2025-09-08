// Data Management Service - API-based implementation for MySQL backend

import {
  Client,
  Service,
  ClientService,
  Invoice,
  Payment,
  Staff,
  AppSettings,
  Measurement,
  MeasurementSet,
  CreateClientData,
  CreateServiceData,
  CreateClientServiceData,
  CreateInvoiceData,
  CreatePaymentData,
  CreateStaffData,
  UpdateAppSettingsData,
  CreateMeasurementData,
  CreateMeasurementSetData,
  ClientFilter,
  ServiceFilter,
  InvoiceFilter,
  StaffFilter,
  DashboardStats,
  BackupData,
} from '@/types';

import {
  getCurrentISOString,
} from '@/utils';

// API Base URL - Updated for URL construction fix
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api'
  : '/api';

// API Helper functions
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data.data || data;
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'}] ${url}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Build URL properly for both development and production
    let url: string;
    const fullEndpoint = `${this.baseUrl}${endpoint}`;
    
    // Debug logging for production issues
    console.log('[DataService] Building URL:', {
      baseUrl: this.baseUrl,
      endpoint,
      fullEndpoint,
      NODE_ENV: process.env.NODE_ENV
    });
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url = `${fullEndpoint}?${searchParams.toString()}`;
    } else {
      url = fullEndpoint;
    }
    
    console.log('[DataService] Final URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        // For 404 errors, return null instead of throwing
        console.warn(`Resource not found: ${endpoint}`);
        return null as T;
      }
      
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse JSON, use default message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.data || data;
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const api = new ApiClient();

// Data Management Class
export class DataService {
  // Client Management
  static async getClients(): Promise<Client[]> {
    try {
      const response = await api.get<{ data: Client[]; pagination: any }>('/clients');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  static async getClient(id: string): Promise<Client | undefined> {
    try {
      // Validate ID format
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.warn('Invalid client ID provided:', id);
        return undefined;
      }
      
      return await api.get<Client>(`/clients/${id}`);
    } catch (error) {
      console.error('Error fetching client:', error);
      return undefined;
    }
  }

  static async createClient(data: CreateClientData): Promise<Client> {
    const clientData = {
      ...data,
      dateJoined: data.dateJoined || getCurrentISOString().split('T')[0],
      streetAddress: data.address?.street || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      zipCode: data.address?.zipCode || '',
      country: data.address?.country || 'USA',
    };

    // Remove the nested address object since we're flattening it
    delete (clientData as any).address;

    return await api.post<Client>('/clients', clientData);
  }

  static async updateClient(id: string, data: Partial<CreateClientData>): Promise<Client | null> {
    try {
      const updateData: any = { ...data };
      
      // Flatten address if provided
      if (data.address) {
        updateData.streetAddress = data.address.street;
        updateData.city = data.address.city;
        updateData.state = data.address.state;
        updateData.zipCode = data.address.zipCode;
        updateData.country = data.address.country;
        delete updateData.address;
      }

      return await api.put<Client>(`/clients/${id}`, updateData);
    } catch (error) {
      console.error('Error updating client:', error);
      return null;
    }
  }

  static async deleteClient(id: string): Promise<boolean> {
    try {
      await api.delete(`/clients/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  static async searchClients(filter: ClientFilter): Promise<Client[]> {
    try {
      const params: any = {};
      
      if (filter.status) params.status = filter.status;
      if (filter.searchTerm) params.search = filter.searchTerm;
      
      const response = await api.get<{ data: Client[]; pagination: any }>('/clients', params);
      return response.data || [];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  // Service Management
  static async getServices(): Promise<Service[]> {
    try {
      const response = await api.get<{ data: Service[]; pagination: any }>('/services');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  static async getService(id: string): Promise<Service | undefined> {
    try {
      return await api.get<Service>(`/services/${id}`);
    } catch (error) {
      console.error('Error fetching service:', error);
      return undefined;
    }
  }

  static async createService(data: CreateServiceData): Promise<Service> {
    return await api.post<Service>('/services', data);
  }

  static async updateService(id: string, data: Partial<CreateServiceData>): Promise<Service | null> {
    try {
      return await api.put<Service>(`/services/${id}`, data);
    } catch (error) {
      console.error('Error updating service:', error);
      return null;
    }
  }

  static async deleteService(id: string): Promise<boolean> {
    try {
      await api.delete(`/services/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  }

  static async searchServices(filter: ServiceFilter): Promise<Service[]> {
    try {
      const params: any = {};
      
      if (filter.category) params.category = filter.category;
      if (filter.isActive !== undefined) params.isActive = filter.isActive;
      if (filter.priceMin !== undefined) params.priceMin = filter.priceMin;
      if (filter.priceMax !== undefined) params.priceMax = filter.priceMax;
      if (filter.searchTerm) params.search = filter.searchTerm;
      
      const response = await api.get<{ data: Service[]; pagination: any }>('/services', params);
      return response.data || [];
    } catch (error) {
      console.error('Error searching services:', error);
      return [];
    }
  }

  // Client Service Management  
  static async getClientServices(): Promise<ClientService[]> {
    try {
      const response = await api.get<{ data: ClientService[]; pagination: any }>('/client-services');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching client services:', error);
      return [];
    }
  }

  static async getClientService(id: string): Promise<ClientService | undefined> {
    try {
      return await api.get<ClientService>(`/client-services/${id}`);
    } catch (error) {
      console.error('Error fetching client service:', error);
      return undefined;
    }
  }

  static async getClientServicesByClient(clientId: string): Promise<ClientService[]> {
    try {
      const response = await api.get<{ data: ClientService[]; pagination: any }>('/client-services', { clientId });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching client services:', error);
      return [];
    }
  }

  static async createClientService(data: CreateClientServiceData): Promise<ClientService> {
    return await api.post<ClientService>('/client-services', data);
  }

  static async updateClientService(id: string, data: Partial<CreateClientServiceData>): Promise<ClientService | null> {
    try {
      return await api.put<ClientService>(`/client-services/${id}`, data);
    } catch (error) {
      console.error('Error updating client service:', error);
      return null;
    }
  }

  static async deleteClientService(id: string): Promise<boolean> {
    try {
      await api.delete(`/client-services/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting client service:', error);
      return false;
    }
  }

  // Invoice Management
  static async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await api.get<{ data: Invoice[]; pagination: any }>('/invoices');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  static async getInvoice(id: string): Promise<Invoice | undefined> {
    try {
      return await api.get<Invoice>(`/invoices/${id}`);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return undefined;
    }
  }

  static async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    try {
      const response = await api.get<{ data: Invoice[]; pagination: any }>('/invoices', { clientId });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  static async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    return await api.post<Invoice>('/invoices', data);
  }

  static async updateInvoice(id: string, data: Partial<CreateInvoiceData>): Promise<Invoice | null> {
    try {
      return await api.put<Invoice>(`/invoices/${id}`, data);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return null;
    }
  }

  static async deleteInvoice(id: string): Promise<boolean> {
    try {
      await api.delete(`/invoices/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  static async searchInvoices(filter: InvoiceFilter): Promise<Invoice[]> {
    try {
      const params: any = {};
      
      if (filter.status) params.status = filter.status;
      if (filter.clientId) params.clientId = filter.clientId;
      if (filter.dateFrom) params.dateFrom = filter.dateFrom;
      if (filter.dateTo) params.dateTo = filter.dateTo;
      if (filter.amountMin !== undefined) params.amountMin = filter.amountMin;
      if (filter.amountMax !== undefined) params.amountMax = filter.amountMax;
      
      const response = await api.get<{ data: Invoice[]; pagination: any }>('/invoices', params);
      return response.data || [];
    } catch (error) {
      console.error('Error searching invoices:', error);
      return [];
    }
  }

  // Payment Management
  static async getPayments(): Promise<Payment[]> {
    try {
      const response = await api.get<{ data: Payment[]; pagination: any }>('/payments');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  static async getPayment(id: string): Promise<Payment | undefined> {
    try {
      return await api.get<Payment>(`/payments/${id}`);
    } catch (error) {
      console.error('Error fetching payment:', error);
      return undefined;
    }
  }

  static async getPaymentsByClient(clientId: string): Promise<Payment[]> {
    try {
      const response = await api.get<{ data: Payment[]; pagination: any }>('/payments', { clientId });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  static async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    try {
      const response = await api.get<{ data: Payment[]; pagination: any }>('/payments', { invoiceId });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  static async createPayment(data: CreatePaymentData): Promise<Payment> {
    return await api.post<Payment>('/payments', data);
  }

  static async updatePayment(id: string, data: Partial<CreatePaymentData>): Promise<Payment | null> {
    try {
      return await api.put<Payment>(`/payments/${id}`, data);
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  }

  static async deletePayment(id: string): Promise<boolean> {
    try {
      await api.delete(`/payments/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  }

  // Settings Management
  static async getSettings(): Promise<AppSettings | null> {
    try {
      const dbSettings = await api.get<any>('/settings');
      
      if (!dbSettings) {
        return null;
      }
      
      // Transform flat database structure to nested AppSettings interface
      const settings: AppSettings = {
        id: dbSettings.id,
        businessName: dbSettings.businessName,
        businessAddress: {
          street: dbSettings.businessStreet || '',
          city: dbSettings.businessCity || '',
          state: dbSettings.businessState || '',
          zipCode: dbSettings.businessZipCode || '',
          country: dbSettings.businessCountry || 'USA',
        },
        businessPhone: dbSettings.businessPhone,
        businessEmail: dbSettings.businessEmail,
        businessWebsite: dbSettings.businessWebsite,
        currency: dbSettings.currency,
        timezone: dbSettings.timezone,
        taxRate: dbSettings.taxRate,
        invoiceSettings: {
          prefix: dbSettings.invoicePrefix || 'INV',
          nextNumber: dbSettings.invoiceNextNumber || 1,
          dueInDays: dbSettings.invoiceDueInDays || 30,
          footerText: dbSettings.invoiceFooterText,
        },
        emailSettings: {
          smtpHost: dbSettings.smtpHost,
          smtpPort: dbSettings.smtpPort,
          smtpUser: dbSettings.smtpUser,
          smtpPassword: dbSettings.smtpPassword,
          fromEmail: dbSettings.fromEmail,
          fromName: dbSettings.fromName,
        },
        backupSettings: {
          autoBackup: dbSettings.autoBackup || false,
          backupFrequency: dbSettings.backupFrequency || 'weekly',
          retentionDays: dbSettings.retentionDays || 30,
        },
        updatedAt: dbSettings.updatedAt || new Date().toISOString(),
      };
      
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  static async updateSettings(data: UpdateAppSettingsData): Promise<AppSettings | null> {
    try {
      // Transform nested AppSettings structure to flat database structure
      const dbData: any = {};
      
      if (data.businessName !== undefined) dbData.businessName = data.businessName;
      if (data.businessPhone !== undefined) dbData.businessPhone = data.businessPhone;
      if (data.businessEmail !== undefined) dbData.businessEmail = data.businessEmail;
      if (data.businessWebsite !== undefined) dbData.businessWebsite = data.businessWebsite;
      if (data.currency !== undefined) dbData.currency = data.currency;
      if (data.timezone !== undefined) dbData.timezone = data.timezone;
      if (data.taxRate !== undefined) dbData.taxRate = data.taxRate;
      
      // Handle nested businessAddress
      if (data.businessAddress) {
        if (data.businessAddress.street !== undefined) dbData.businessStreet = data.businessAddress.street;
        if (data.businessAddress.city !== undefined) dbData.businessCity = data.businessAddress.city;
        if (data.businessAddress.state !== undefined) dbData.businessState = data.businessAddress.state;
        if (data.businessAddress.zipCode !== undefined) dbData.businessZipCode = data.businessAddress.zipCode;
        if (data.businessAddress.country !== undefined) dbData.businessCountry = data.businessAddress.country;
      }
      
      // Handle nested invoiceSettings
      if (data.invoiceSettings) {
        if (data.invoiceSettings.prefix !== undefined) dbData.invoicePrefix = data.invoiceSettings.prefix;
        if (data.invoiceSettings.nextNumber !== undefined) dbData.invoiceNextNumber = data.invoiceSettings.nextNumber;
        if (data.invoiceSettings.dueInDays !== undefined) dbData.invoiceDueInDays = data.invoiceSettings.dueInDays;
        if (data.invoiceSettings.footerText !== undefined) dbData.invoiceFooterText = data.invoiceSettings.footerText;
      }
      
      // Handle nested emailSettings
      if (data.emailSettings) {
        if (data.emailSettings.smtpHost !== undefined) dbData.smtpHost = data.emailSettings.smtpHost;
        if (data.emailSettings.smtpPort !== undefined) dbData.smtpPort = data.emailSettings.smtpPort;
        if (data.emailSettings.smtpUser !== undefined) dbData.smtpUser = data.emailSettings.smtpUser;
        if (data.emailSettings.smtpPassword !== undefined) dbData.smtpPassword = data.emailSettings.smtpPassword;
        if (data.emailSettings.fromEmail !== undefined) dbData.fromEmail = data.emailSettings.fromEmail;
        if (data.emailSettings.fromName !== undefined) dbData.fromName = data.emailSettings.fromName;
      }
      
      // Handle nested backupSettings
      if (data.backupSettings) {
        if (data.backupSettings.autoBackup !== undefined) dbData.autoBackup = data.backupSettings.autoBackup;
        if (data.backupSettings.backupFrequency !== undefined) dbData.backupFrequency = data.backupSettings.backupFrequency;
        if (data.backupSettings.retentionDays !== undefined) dbData.retentionDays = data.backupSettings.retentionDays;
      }
      
      const dbSettings = await api.put<any>('/settings', dbData);
      if (!dbSettings) return null;
      
      // Transform the response back to AppSettings interface
      return this.getSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }

  // Staff Management - Placeholder methods for future implementation
  static async getStaff(): Promise<Staff[]> {
    console.warn('getStaff: Staff management not implemented yet');
    return [];
  }

  static async getStaffMember(id: string): Promise<Staff | undefined> {
    console.warn('getStaffMember: Staff management not implemented yet');
    return undefined;
  }

  static async createStaff(data: CreateStaffData): Promise<Staff> {
    console.warn('createStaff: Staff management not implemented yet');
    throw new Error('Staff management not implemented');
  }

  static async updateStaff(id: string, data: Partial<CreateStaffData>): Promise<Staff | null> {
    console.warn('updateStaff: Staff management not implemented yet');
    return null;
  }

  static async deleteStaff(id: string): Promise<boolean> {
    console.warn('deleteStaff: Staff management not implemented yet');
    return false;
  }

  static async searchStaff(filter: StaffFilter): Promise<Staff[]> {
    console.warn('searchStaff: Staff management not implemented yet');
    return [];
  }

  // Measurement Management - Placeholder methods for future implementation
  static getMeasurements(): Measurement[] {
    console.warn('getMeasurements: Measurements not implemented yet');
    return [];
  }

  static getClientMeasurements(clientId: string): Measurement[] {
    console.warn('getClientMeasurements: Measurements not implemented yet');
    return [];
  }

  static createMeasurement(data: CreateMeasurementData): Measurement {
    console.warn('createMeasurement: Measurements not implemented yet');
    throw new Error('Measurements not implemented');
  }

  static updateMeasurement(id: string, data: Partial<CreateMeasurementData>): Measurement | null {
    console.warn('updateMeasurement: Measurements not implemented yet');
    return null;
  }

  static deleteMeasurement(id: string): boolean {
    console.warn('deleteMeasurement: Measurements not implemented yet');
    return false;
  }

  // Measurement Set Management - Placeholder methods for future implementation
  static getAllMeasurementSets(): MeasurementSet[] {
    console.warn('getAllMeasurementSets: Measurements not implemented yet');
    return [];
  }

  static getMeasurementSet(id: string): MeasurementSet | undefined {
    console.warn('getMeasurementSet: Measurements not implemented yet');
    return undefined;
  }

  static getMeasurementSets(clientId: string): MeasurementSet[] {
    console.warn('getMeasurementSets: Measurements not implemented yet');
    return [];
  }

  static createMeasurementSet(data: CreateMeasurementSetData): MeasurementSet {
    console.warn('createMeasurementSet: Measurements not implemented yet');
    throw new Error('Measurements not implemented');
  }

  static updateMeasurementSet(id: string, data: Partial<CreateMeasurementSetData>): MeasurementSet | null {
    console.warn('updateMeasurementSet: Measurements not implemented yet');
    return null;
  }

  static deleteMeasurementSet(id: string): boolean {
    console.warn('deleteMeasurementSet: Measurements not implemented yet');
    return false;
  }

  // Dashboard Statistics - Placeholder method for future implementation
  static getDashboardStats(): DashboardStats {
    console.warn('getDashboardStats: Dashboard stats not implemented yet');
    return {
      totalClients: 0,
      activeClients: 0,
      vipClients: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      scheduledServices: 0,
      completedServicesThisMonth: 0,
    };
  }

  // Backup and Restore - Placeholder methods for future implementation
  static exportData(): BackupData {
    console.warn('exportData: Not implemented for API-based storage');
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        clients: [],
        services: [],
        clientServices: [],
        invoices: [],
        payments: [],
        staff: [],
        settings: {} as AppSettings,
        measurements: [],
        measurementSets: [],
      },
    };
  }

  static importData(data: BackupData): boolean {
    console.warn('importData: Not implemented for API-based storage');
    return false;
  }

  static clearAllData(): void {
    console.warn('clearAllData: Not implemented for API-based storage');
  }

  static initializeSampleData(): void {
    console.warn('initializeSampleData: Not implemented for API-based storage');
  }

  // Methods expected by BackupRestore component
  static exportBackup(): string {
    const data = this.exportData();
    return JSON.stringify(data, null, 2);
  }

  static createBackup(): BackupData {
    return this.exportData();
  }

  static restoreFromBackup(data: BackupData): boolean {
    return this.importData(data);
  }
}