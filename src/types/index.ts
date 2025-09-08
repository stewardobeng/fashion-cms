// Core entity interfaces for the Fashion Client Management System

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  ageBracket?: AgeBracket;
  dateJoined: string;
  skinColor?: SkinColor;
  ukSize?: UKSize;
  colorShades?: string; // JSON string
  refashioning?: string; // JSON string
  embellishments?: string; // JSON string
  notes?: string;
  preferredContactMethod: 'email' | 'phone' | 'text';
  createdAt: string;
  updatedAt: string;
  status: ClientStatus;
  // totalSpent: calculated dynamically from payments relation
  lastServiceDate?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  basePrice: number;
  duration: number; // in minutes
  isActive: boolean;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceId: string;
  scheduledDate: string;
  startDate?: string;
  completionDate?: string;
  completedDate?: string;
  status: ServiceStatus;
  assignedStaff?: string;
  notes?: string;
  customPrice?: number; // Override base price if needed
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientServiceIds: string[];
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  permissions: Permission[];
  isActive: boolean;
  hireDate: string;
  avatar?: string;
  salary?: number;
  department?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  businessName: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessPhone: string;
  businessEmail: string;
  businessWebsite?: string;
  currency: Currency;
  timezone: string;
  taxRate: number;
  invoiceSettings: {
    prefix: string;
    nextNumber: number;
    dueInDays: number;
    footerText?: string;
  };
  emailSettings: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail: string;
    fromName: string;
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
  updatedAt: string;
}

export interface Measurement {
  id: string;
  clientId: string;
  type: MeasurementType;
  value: number;
  unit: 'cm' | 'inches';
  notes?: string;
  takenBy: string;
  takenDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementSet {
  id: string;
  clientId: string;
  name: string; // e.g., "Initial Measurements", "Wedding Dress Fitting #1"
  measurements: Measurement[];
  takenBy: string;
  takenDate: string;
  purpose?: string; // e.g., "Wedding dress", "Business suit"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Measurement categories for better organization
export interface MeasurementCategory {
  name: string;
  measurements: MeasurementType[];
  description: string;
}

export enum MeasurementType {
  // Upper Body Measurements
  BUST = 'bust',
  CHEST = 'chest',
  UNDERBUST = 'underbust',
  WAIST = 'waist',
  NATURAL_WAIST = 'natural_waist',
  HIGH_WAIST = 'high_waist',
  HIPS = 'hips',
  HIGH_HIP = 'high_hip',
  SHOULDER_WIDTH = 'shoulder_width',
  SHOULDER_TO_SHOULDER = 'shoulder_to_shoulder',
  BACK_WIDTH = 'back_width',
  FRONT_WIDTH = 'front_width',
  NECK_CIRCUMFERENCE = 'neck_circumference',
  NECK_TO_WAIST_FRONT = 'neck_to_waist_front',
  NECK_TO_WAIST_BACK = 'neck_to_waist_back',
  
  // Arm Measurements
  ARM_LENGTH = 'arm_length',
  SLEEVE_LENGTH = 'sleeve_length',
  UPPER_ARM_CIRCUMFERENCE = 'upper_arm_circumference',
  FOREARM_CIRCUMFERENCE = 'forearm_circumference',
  WRIST_CIRCUMFERENCE = 'wrist_circumference',
  ARMPIT_TO_WRIST = 'armpit_to_wrist',
  SHOULDER_TO_WRIST = 'shoulder_to_wrist',
  ARMHOLE_CIRCUMFERENCE = 'armhole_circumference',
  
  // Lower Body Measurements
  INSEAM = 'inseam',
  OUTSEAM = 'outseam',
  THIGH_CIRCUMFERENCE = 'thigh_circumference',
  KNEE_CIRCUMFERENCE = 'knee_circumference',
  CALF_CIRCUMFERENCE = 'calf_circumference',
  ANKLE_CIRCUMFERENCE = 'ankle_circumference',
  WAIST_TO_HIP = 'waist_to_hip',
  WAIST_TO_KNEE = 'waist_to_knee',
  WAIST_TO_ANKLE = 'waist_to_ankle',
  HIP_TO_KNEE = 'hip_to_knee',
  HIP_TO_ANKLE = 'hip_to_ankle',
  CROTCH_DEPTH = 'crotch_depth',
  RISE = 'rise',
  
  // Torso Length Measurements
  FRONT_LENGTH = 'front_length',
  BACK_LENGTH = 'back_length',
  SIDE_SEAM = 'side_seam',
  CENTER_FRONT_LENGTH = 'center_front_length',
  CENTER_BACK_LENGTH = 'center_back_length',
  BUST_POINT_TO_BUST_POINT = 'bust_point_to_bust_point',
  SHOULDER_TO_BUST = 'shoulder_to_bust',
  WAIST_TO_BUST = 'waist_to_bust',
  
  // Special Measurements for Different Garments
  BICEP = 'bicep',
  ELBOW_CIRCUMFERENCE = 'elbow_circumference',
  BACK_RISE = 'back_rise',
  FRONT_RISE = 'front_rise',
  SEAT_CIRCUMFERENCE = 'seat_circumference',
  UPPER_THIGH = 'upper_thigh',
  
  // Head and Neck (for accessories)
  HEAD_CIRCUMFERENCE = 'head_circumference',
  HAT_SIZE = 'hat_size',
  
  // Dress/Skirt Specific
  SKIRT_LENGTH = 'skirt_length',
  DRESS_LENGTH = 'dress_length',
  MIDI_LENGTH = 'midi_length',
  MAXI_LENGTH = 'maxi_length',
  
  // Jacket/Blazer Specific
  JACKET_LENGTH = 'jacket_length',
  LAPEL_WIDTH = 'lapel_width',
  BUTTON_STANCE = 'button_stance'
}

export const MEASUREMENT_CATEGORIES: MeasurementCategory[] = [
  {
    name: 'Upper Body',
    description: 'Measurements for tops, blouses, jackets, and dresses',
    measurements: [
      MeasurementType.BUST,
      MeasurementType.CHEST,
      MeasurementType.UNDERBUST,
      MeasurementType.WAIST,
      MeasurementType.NATURAL_WAIST,
      MeasurementType.HIGH_WAIST,
      MeasurementType.SHOULDER_WIDTH,
      MeasurementType.SHOULDER_TO_SHOULDER,
      MeasurementType.BACK_WIDTH,
      MeasurementType.FRONT_WIDTH,
      MeasurementType.NECK_CIRCUMFERENCE,
      MeasurementType.NECK_TO_WAIST_FRONT,
      MeasurementType.NECK_TO_WAIST_BACK,
    ]
  },
  {
    name: 'Arms',
    description: 'Measurements for sleeves and arm fitting',
    measurements: [
      MeasurementType.ARM_LENGTH,
      MeasurementType.SLEEVE_LENGTH,
      MeasurementType.UPPER_ARM_CIRCUMFERENCE,
      MeasurementType.FOREARM_CIRCUMFERENCE,
      MeasurementType.WRIST_CIRCUMFERENCE,
      MeasurementType.ARMPIT_TO_WRIST,
      MeasurementType.SHOULDER_TO_WRIST,
      MeasurementType.ARMHOLE_CIRCUMFERENCE,
      MeasurementType.BICEP,
      MeasurementType.ELBOW_CIRCUMFERENCE,
    ]
  },
  {
    name: 'Lower Body',
    description: 'Measurements for pants, skirts, and dresses',
    measurements: [
      MeasurementType.HIPS,
      MeasurementType.HIGH_HIP,
      MeasurementType.INSEAM,
      MeasurementType.OUTSEAM,
      MeasurementType.THIGH_CIRCUMFERENCE,
      MeasurementType.KNEE_CIRCUMFERENCE,
      MeasurementType.CALF_CIRCUMFERENCE,
      MeasurementType.ANKLE_CIRCUMFERENCE,
      MeasurementType.WAIST_TO_HIP,
      MeasurementType.WAIST_TO_KNEE,
      MeasurementType.WAIST_TO_ANKLE,
      MeasurementType.HIP_TO_KNEE,
      MeasurementType.HIP_TO_ANKLE,
      MeasurementType.CROTCH_DEPTH,
      MeasurementType.RISE,
      MeasurementType.BACK_RISE,
      MeasurementType.FRONT_RISE,
      MeasurementType.SEAT_CIRCUMFERENCE,
      MeasurementType.UPPER_THIGH,
    ]
  },
  {
    name: 'Length Measurements',
    description: 'Length measurements for garment fitting',
    measurements: [
      MeasurementType.FRONT_LENGTH,
      MeasurementType.BACK_LENGTH,
      MeasurementType.SIDE_SEAM,
      MeasurementType.CENTER_FRONT_LENGTH,
      MeasurementType.CENTER_BACK_LENGTH,
      MeasurementType.BUST_POINT_TO_BUST_POINT,
      MeasurementType.SHOULDER_TO_BUST,
      MeasurementType.WAIST_TO_BUST,
      MeasurementType.SKIRT_LENGTH,
      MeasurementType.DRESS_LENGTH,
      MeasurementType.MIDI_LENGTH,
      MeasurementType.MAXI_LENGTH,
      MeasurementType.JACKET_LENGTH,
    ]
  },
  {
    name: 'Special & Accessories',
    description: 'Specialized measurements and accessories',
    measurements: [
      MeasurementType.HEAD_CIRCUMFERENCE,
      MeasurementType.HAT_SIZE,
      MeasurementType.LAPEL_WIDTH,
      MeasurementType.BUTTON_STANCE,
    ]
  }
];

// Helper function to get measurement display name
export function getMeasurementDisplayName(type: MeasurementType): string {
  const names: Record<MeasurementType, string> = {
    [MeasurementType.BUST]: 'Bust',
    [MeasurementType.CHEST]: 'Chest',
    [MeasurementType.UNDERBUST]: 'Under Bust',
    [MeasurementType.WAIST]: 'Waist',
    [MeasurementType.NATURAL_WAIST]: 'Natural Waist',
    [MeasurementType.HIGH_WAIST]: 'High Waist',
    [MeasurementType.HIPS]: 'Hips',
    [MeasurementType.HIGH_HIP]: 'High Hip',
    [MeasurementType.SHOULDER_WIDTH]: 'Shoulder Width',
    [MeasurementType.SHOULDER_TO_SHOULDER]: 'Shoulder to Shoulder',
    [MeasurementType.BACK_WIDTH]: 'Back Width',
    [MeasurementType.FRONT_WIDTH]: 'Front Width',
    [MeasurementType.NECK_CIRCUMFERENCE]: 'Neck Circumference',
    [MeasurementType.NECK_TO_WAIST_FRONT]: 'Neck to Waist (Front)',
    [MeasurementType.NECK_TO_WAIST_BACK]: 'Neck to Waist (Back)',
    [MeasurementType.ARM_LENGTH]: 'Arm Length',
    [MeasurementType.SLEEVE_LENGTH]: 'Sleeve Length',
    [MeasurementType.UPPER_ARM_CIRCUMFERENCE]: 'Upper Arm',
    [MeasurementType.FOREARM_CIRCUMFERENCE]: 'Forearm',
    [MeasurementType.WRIST_CIRCUMFERENCE]: 'Wrist',
    [MeasurementType.ARMPIT_TO_WRIST]: 'Armpit to Wrist',
    [MeasurementType.SHOULDER_TO_WRIST]: 'Shoulder to Wrist',
    [MeasurementType.ARMHOLE_CIRCUMFERENCE]: 'Armhole',
    [MeasurementType.INSEAM]: 'Inseam',
    [MeasurementType.OUTSEAM]: 'Outseam',
    [MeasurementType.THIGH_CIRCUMFERENCE]: 'Thigh',
    [MeasurementType.KNEE_CIRCUMFERENCE]: 'Knee',
    [MeasurementType.CALF_CIRCUMFERENCE]: 'Calf',
    [MeasurementType.ANKLE_CIRCUMFERENCE]: 'Ankle',
    [MeasurementType.WAIST_TO_HIP]: 'Waist to Hip',
    [MeasurementType.WAIST_TO_KNEE]: 'Waist to Knee',
    [MeasurementType.WAIST_TO_ANKLE]: 'Waist to Ankle',
    [MeasurementType.HIP_TO_KNEE]: 'Hip to Knee',
    [MeasurementType.HIP_TO_ANKLE]: 'Hip to Ankle',
    [MeasurementType.CROTCH_DEPTH]: 'Crotch Depth',
    [MeasurementType.RISE]: 'Rise',
    [MeasurementType.FRONT_LENGTH]: 'Front Length',
    [MeasurementType.BACK_LENGTH]: 'Back Length',
    [MeasurementType.SIDE_SEAM]: 'Side Seam',
    [MeasurementType.CENTER_FRONT_LENGTH]: 'Center Front Length',
    [MeasurementType.CENTER_BACK_LENGTH]: 'Center Back Length',
    [MeasurementType.BUST_POINT_TO_BUST_POINT]: 'Bust Point to Bust Point',
    [MeasurementType.SHOULDER_TO_BUST]: 'Shoulder to Bust',
    [MeasurementType.WAIST_TO_BUST]: 'Waist to Bust',
    [MeasurementType.BICEP]: 'Bicep',
    [MeasurementType.ELBOW_CIRCUMFERENCE]: 'Elbow',
    [MeasurementType.BACK_RISE]: 'Back Rise',
    [MeasurementType.FRONT_RISE]: 'Front Rise',
    [MeasurementType.SEAT_CIRCUMFERENCE]: 'Seat',
    [MeasurementType.UPPER_THIGH]: 'Upper Thigh',
    [MeasurementType.HEAD_CIRCUMFERENCE]: 'Head Circumference',
    [MeasurementType.HAT_SIZE]: 'Hat Size',
    [MeasurementType.SKIRT_LENGTH]: 'Skirt Length',
    [MeasurementType.DRESS_LENGTH]: 'Dress Length',
    [MeasurementType.MIDI_LENGTH]: 'Midi Length',
    [MeasurementType.MAXI_LENGTH]: 'Maxi Length',
    [MeasurementType.JACKET_LENGTH]: 'Jacket Length',
    [MeasurementType.LAPEL_WIDTH]: 'Lapel Width',
    [MeasurementType.BUTTON_STANCE]: 'Button Stance',
  };
  return names[type] || type;
}

// Create measurement data types
export type CreateMeasurementData = Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateMeasurementSetData = Omit<MeasurementSet, 'id' | 'createdAt' | 'updatedAt' | 'measurements'> & {
  measurements: CreateMeasurementData[];
};
export type CreatePaymentData = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateStaffData = Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAppSettingsData = Partial<Omit<AppSettings, 'id' | 'updatedAt'>>;

export interface StaffFilter {
  role?: StaffRole;
  department?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    clients: Client[];
    services: Service[];
    clientServices: ClientService[];
    invoices: Invoice[];
    payments: Payment[];
    staff: Staff[];
    settings: AppSettings;
    measurements: Measurement[];
    measurementSets: MeasurementSet[];
  };
}

// Role-based permission helpers
export const getRolePermissions = (role: StaffRole): Permission[] => {
  switch (role) {
    case StaffRole.ADMIN:
      return Object.values(Permission);
    case StaffRole.MANAGER:
      return [
        Permission.MANAGE_CLIENTS,
        Permission.VIEW_CLIENTS,
        Permission.MANAGE_SERVICES,
        Permission.VIEW_SERVICES,
        Permission.MANAGE_INVOICES,
        Permission.VIEW_INVOICES,
        Permission.MANAGE_PAYMENTS,
        Permission.VIEW_PAYMENTS,
        Permission.VIEW_STAFF,
        Permission.VIEW_REPORTS
      ];
    case StaffRole.STAFF:
      return [
        Permission.VIEW_CLIENTS,
        Permission.VIEW_SERVICES,
        Permission.VIEW_INVOICES,
        Permission.MANAGE_PAYMENTS,
        Permission.VIEW_PAYMENTS
      ];
    case StaffRole.ASSISTANT:
      return [
        Permission.VIEW_CLIENTS,
        Permission.VIEW_SERVICES,
        Permission.VIEW_INVOICES
      ];
    default:
      return [];
  }
};

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case Currency.USD: return '$';
    case Currency.EUR: return '€';
    case Currency.GBP: return '£';
    case Currency.CAD: return 'C$';
    case Currency.AUD: return 'A$';
    case Currency.JPY: return '¥';
    default: return '$';
  }
};

// Helper functions for new client data fields
export const getAgeBracketDisplayName = (ageBracket: AgeBracket): string => {
  switch (ageBracket) {
    case AgeBracket.UNDER_18: return 'Under 18';
    case AgeBracket.AGE_18_25: return '18-25';
    case AgeBracket.AGE_26_35: return '26-35';
    case AgeBracket.AGE_36_45: return '36-45';
    case AgeBracket.AGE_46_55: return '46-55';
    case AgeBracket.AGE_56_65: return '56-65';
    case AgeBracket.OVER_65: return 'Over 65';
    default: return ageBracket;
  }
};

export const getSkinColorDisplayName = (skinColor: SkinColor): string => {
  switch (skinColor) {
    case SkinColor.DARK: return 'Dark';
    case SkinColor.BROWN: return 'Brown';
    case SkinColor.FAIR: return 'Fair';
    case SkinColor.BRIGHT: return 'Bright';
    default: return skinColor;
  }
};

export const getColorShadeDisplayName = (colorShade: ColorShade): string => {
  return colorShade.charAt(0).toUpperCase() + colorShade.slice(1);
};

export const getRefashioningTypeDisplayName = (type: RefashioningType): string => {
  switch (type) {
    case RefashioningType.SLEEVE: return 'Sleeve';
    case RefashioningType.NECKLINE: return 'Neckline';
    case RefashioningType.WAIST_LINE: return 'Waist Line';
    case RefashioningType.SKIRT: return 'Skirt';
    case RefashioningType.PANTS: return 'Pants';
    case RefashioningType.ADD_POCKET: return 'Add Pocket';
    case RefashioningType.REMOVE_POCKET: return 'Remove Pocket';
    default: return type;
  }
};

export const getEmbellishmentTypeDisplayName = (type: EmbellishmentType): string => {
  switch (type) {
    case EmbellishmentType.STONES: return 'Stones';
    case EmbellishmentType.BEADS: return 'Beads';
    case EmbellishmentType.ACCESSORIES: return 'Accessories';
    default: return type;
  }
};

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VIP = 'vip',
  SUSPENDED = 'suspended'
}

export enum ServiceCategory {
  DESIGN = 'design',
  TAILORING = 'tailoring',
  ALTERATIONS = 'alterations',
  CONSULTATION = 'consultation',
  FITTING = 'fitting',
  STYLING = 'styling',
  CUSTOM_COUTURE = 'custom_couture'
}

export enum ServiceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  PARTIALLY_PAID = 'partially_paid'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital_wallet'
}

export enum StaffRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  ASSISTANT = 'assistant'
}

export enum Permission {
  MANAGE_CLIENTS = 'manage_clients',
  VIEW_CLIENTS = 'view_clients',
  MANAGE_SERVICES = 'manage_services',
  VIEW_SERVICES = 'view_services',
  MANAGE_INVOICES = 'manage_invoices',
  VIEW_INVOICES = 'view_invoices',
  MANAGE_PAYMENTS = 'manage_payments',
  VIEW_PAYMENTS = 'view_payments',
  MANAGE_STAFF = 'manage_staff',
  VIEW_STAFF = 'view_staff',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_REPORTS = 'view_reports',
  BACKUP_RESTORE = 'backup_restore'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY'
}

// New enums for enhanced client data
export enum AgeBracket {
  UNDER_18 = 'under_18',
  AGE_18_25 = '18_25',
  AGE_26_35 = '26_35',
  AGE_36_45 = '36_45',
  AGE_46_55 = '46_55',
  AGE_56_65 = '56_65',
  OVER_65 = 'over_65'
}

export enum SkinColor {
  DARK = 'dark',
  BROWN = 'brown',
  FAIR = 'fair',
  BRIGHT = 'bright'
}

export enum UKSize {
  SIZE_8 = '8',
  SIZE_10 = '10',
  SIZE_12 = '12',
  SIZE_14 = '14',
  SIZE_16 = '16',
  SIZE_18 = '18',
  SIZE_20 = '20',
  SIZE_22 = '22',
  SIZE_24 = '24',
  SIZE_26 = '26',
  SIZE_28 = '28',
  SIZE_30 = '30',
  SIZE_32 = '32',
  SIZE_34 = '34',
  SIZE_36 = '36',
  SIZE_38 = '38',
  SIZE_40 = '40'
}

export enum ColorShade {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  PURPLE = 'purple',
  PINK = 'pink',
  BLACK = 'black',
  WHITE = 'white',
  GREY = 'grey',
  BROWN = 'brown',
  NAVY = 'navy',
  BEIGE = 'beige',
  GOLD = 'gold',
  SILVER = 'silver'
}

export enum RefashioningType {
  SLEEVE = 'sleeve',
  NECKLINE = 'neckline',
  WAIST_LINE = 'waist_line',
  SKIRT = 'skirt',
  PANTS = 'pants',
  ADD_POCKET = 'add_pocket',
  REMOVE_POCKET = 'remove_pocket'
}

export enum EmbellishmentType {
  STONES = 'stones',
  BEADS = 'beads',
  ACCESSORIES = 'accessories'
}

export interface RefashioningPreferences {
  selectedTypes: RefashioningType[];
  notes?: string;
}

export interface EmbellishmentPreferences {
  selectedTypes: EmbellishmentType[];
  notes?: string;
}

// Utility types for forms and API responses
export type CreateClientData = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'lastServiceDate'>;
export type UpdateClientData = Partial<CreateClientData>;

export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateServiceData = Partial<CreateServiceData>;

export type CreateClientServiceData = Omit<ClientService, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClientServiceData = Partial<CreateClientServiceData>;

export type CreateInvoiceData = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>;
export type UpdateInvoiceData = Partial<CreateInvoiceData>;

// Dashboard and Analytics types
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  scheduledServices: number;
  completedServicesThisMonth: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  servicesCount: number;
}

export interface ClientServiceHistory {
  client: Client;
  services: (ClientService & { service: Service })[];
  // totalSpent: calculated dynamically from payments
  lastService?: ClientService & { service: Service };
}

// Search and Filter types
export interface ClientFilter {
  status?: ClientStatus;
  searchTerm?: string;
  lastServiceFrom?: string;
  lastServiceTo?: string;
  // totalSpentMin?: number; // calculated dynamically
  // totalSpentMax?: number; // calculated dynamically
}

export interface ServiceFilter {
  category?: ServiceCategory;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  searchTerm?: string;
}

export interface InvoiceFilter {
  status?: InvoiceStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}