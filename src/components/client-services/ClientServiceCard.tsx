'use client';

import { Client, Service, ClientService, ServiceStatus } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/utils';

interface ClientServiceCardProps {
  clientService: ClientService & { client: Client; service: Service };
  onEdit: (clientService: ClientService) => void;
  onDelete: (clientServiceId: string) => void;
}

const getStatusStyle = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.SCHEDULED:
      return 'status-badge text-blue-600 bg-blue-100';
    case ServiceStatus.IN_PROGRESS:
      return 'status-badge text-yellow-600 bg-yellow-100';
    case ServiceStatus.COMPLETED:
      return 'status-badge text-green-600 bg-green-100';
    case ServiceStatus.CANCELLED:
      return 'status-badge text-red-600 bg-red-100';
    case ServiceStatus.NO_SHOW:
      return 'status-badge text-orange-600 bg-orange-100';
    case ServiceStatus.RESCHEDULED:
      return 'status-badge text-purple-600 bg-purple-100';
    default:
      return 'status-badge text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.SCHEDULED:
      return '📅';
    case ServiceStatus.IN_PROGRESS:
      return '⏳';
    case ServiceStatus.COMPLETED:
      return '✅';
    case ServiceStatus.CANCELLED:
      return '❌';
    case ServiceStatus.NO_SHOW:
      return '👻';
    case ServiceStatus.RESCHEDULED:
      return '🔄';
    default:
      return '❓';
  }
};

export default function ClientServiceCard({ clientService, onEdit, onDelete }: ClientServiceCardProps) {
  const { client, service } = clientService;
  const price = clientService.customPrice || service.basePrice;
  const clientInitials = `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {clientInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {client.firstName} {client.lastName}
            </h3>
            <p className="text-sm text-gray-600 truncate">{service.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onEdit(clientService)}
            className="text-gray-400 hover:text-primary-600 transition-colors"
            title="Edit assignment"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(clientService.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete assignment"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Status and Category */}
      <div className="flex items-center justify-between mb-4">
        <div className={getStatusStyle(clientService.status)}>
          <span className="mr-1">{getStatusIcon(clientService.status)}</span>
          {clientService.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {service.category.replace('_', ' ')}
        </span>
      </div>

      {/* Service Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Scheduled:</span>
          <span className="font-medium">{formatDateTime(clientService.scheduledDate)}</span>
        </div>
        
        {clientService.completedDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium">{formatDateTime(clientService.completedDate)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Price:</span>
          <span className="font-semibold text-primary-600">
            {formatCurrency(price)}
            {clientService.customPrice && (
              <span className="text-xs text-gray-500 ml-1">(custom)</span>
            )}
          </span>
        </div>

        {clientService.assignedStaff && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Staff:</span>
            <span className="font-medium">{clientService.assignedStaff}</span>
          </div>
        )}
      </div>

      {/* Client Contact */}
      <div className="space-y-1 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📧</span>
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📞</span>
          <span>{client.phone}</span>
        </div>
      </div>

      {/* Notes */}
      {clientService.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2" title={clientService.notes}>
            {clientService.notes.length > 100 
              ? `${clientService.notes.substring(0, 100)}...` 
              : clientService.notes
            }
          </p>
        </div>
      )}

      {/* Service Duration */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Duration: {service.duration} minutes</span>
          <span>Added: {formatDate(clientService.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}