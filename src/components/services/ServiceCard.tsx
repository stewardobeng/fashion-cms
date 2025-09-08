'use client';

import { Service, ServiceCategory } from '@/types';
import { formatCurrency } from '@/utils';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const getCategoryIcon = (category: ServiceCategory): string => {
  switch (category) {
    case ServiceCategory.DESIGN:
      return '🎨';
    case ServiceCategory.TAILORING:
      return '✂️';
    case ServiceCategory.ALTERATIONS:
      return '🔧';
    case ServiceCategory.CONSULTATION:
      return '💭';
    case ServiceCategory.FITTING:
      return '📏';
    case ServiceCategory.STYLING:
      return '👗';
    case ServiceCategory.CUSTOM_COUTURE:
      return '👑';
    default:
      return '⚡';
  }
};

const getCategoryColor = (category: ServiceCategory): string => {
  switch (category) {
    case ServiceCategory.DESIGN:
      return 'bg-purple-50 text-purple-600';
    case ServiceCategory.TAILORING:
      return 'bg-blue-50 text-blue-600';
    case ServiceCategory.ALTERATIONS:
      return 'bg-green-50 text-green-600';
    case ServiceCategory.CONSULTATION:
      return 'bg-yellow-50 text-yellow-600';
    case ServiceCategory.FITTING:
      return 'bg-pink-50 text-pink-600';
    case ServiceCategory.STYLING:
      return 'bg-indigo-50 text-indigo-600';
    case ServiceCategory.CUSTOM_COUTURE:
      return 'bg-orange-50 text-orange-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-3 ${getCategoryColor(service.category)}`}>
            {getCategoryIcon(service.category)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{service.name}</h3>
            <div className="flex items-center mt-1">
              <span className={`status-badge ${getCategoryColor(service.category)}`}>
                {service.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {!service.isActive && (
                <span className="status-badge text-gray-600 bg-gray-100 ml-2">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onEdit(service)}
            className="text-gray-400 hover:text-primary-600 transition-colors"
            title="Edit service"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete service"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {service.description}
        </p>
      </div>

      {/* Price and Duration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(service.basePrice)}
          </div>
          <div className="text-xs text-gray-500">Base Price</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">
            {formatDuration(service.duration)}
          </div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
      </div>

      {/* Requirements */}
      {service.requirements && service.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
          <div className="space-y-1">
            {service.requirements.slice(0, 3).map((requirement, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {requirement}
              </div>
            ))}
            {service.requirements.length > 3 && (
              <div className="text-xs text-gray-500 italic">
                +{service.requirements.length - 3} more requirements
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {new Date(service.createdAt).toLocaleDateString()}</span>
          <span className={`flex items-center ${service.isActive ? 'text-green-600' : 'text-gray-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-1 ${service.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}