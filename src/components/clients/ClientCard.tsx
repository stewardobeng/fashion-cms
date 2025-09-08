'use client';

import { useRouter } from 'next/navigation';
import { Client, ClientStatus } from '@/types';
import { formatDate, formatCurrency } from '@/utils';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const getStatusBadgeStyle = (status: ClientStatus): string => {
  switch (status) {
    case ClientStatus.ACTIVE:
      return 'status-badge text-green-600 bg-green-100';
    case ClientStatus.VIP:
      return 'status-badge text-yellow-600 bg-yellow-100';
    case ClientStatus.INACTIVE:
      return 'status-badge text-gray-600 bg-gray-100';
    case ClientStatus.SUSPENDED:
      return 'status-badge text-red-600 bg-red-100';
    default:
      return 'status-badge text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: ClientStatus): string => {
  switch (status) {
    case ClientStatus.ACTIVE:
      return '✅';
    case ClientStatus.VIP:
      return '⭐';
    case ClientStatus.INACTIVE:
      return '⏸️';
    case ClientStatus.SUSPENDED:
      return '🚫';
    default:
      return '❓';
  }
};

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const router = useRouter();
  const fullName = `${client.firstName} ${client.lastName}`;
  const initials = `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

  const handleViewDetails = () => {
    router.push(`/clients/${client.id}`);
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
            <div className={getStatusBadgeStyle(client.status)}>
              <span className="mr-1">{getStatusIcon(client.status)}</span>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(client)}
            className="text-gray-400 hover:text-primary-600 transition-colors"
            title="Edit client"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete client"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📧</span>
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📞</span>
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📍</span>
          <span className="truncate">
            {client.address.city}, {client.address.state}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {client.lastServiceDate ? formatDate(client.lastServiceDate) : 'Never'}
          </div>
          <div className="text-xs text-gray-500">Last Service</div>
        </div>
      </div>

      {/* Notes Preview */}
      {client.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-2" title={client.notes}>
            {client.notes.length > 100 ? `${client.notes.substring(0, 100)}...` : client.notes}
          </p>
        </div>
      )}

      {/* Contact Preference */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Prefers: {client.preferredContactMethod}</span>
          <span>Added: {formatDate(client.createdAt)}</span>
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleViewDetails}
          className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          👁️ View Details
        </button>
      </div>
    </div>
  );
}