'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Staff, StaffRole, StaffFilter } from '@/types';
import { formatDate } from '@/utils';
import StaffForm from './StaffForm';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';

interface StaffManagementProps {
  onDataChange: () => void;
}

export default function StaffManagement({ onDataChange }: StaffManagementProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [filter, setFilter] = useState<StaffFilter>({});
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [staff, filter]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const staffData = await DataService.getStaff();
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await DataService.searchStaff(filter);
      setFilteredStaff(filtered);
    } catch (error) {
      console.error('Error filtering staff:', error);
      setFilteredStaff([]);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  const handleRoleFilter = (role: StaffRole | '') => {
    setFilter(prev => ({ 
      ...prev, 
      role: role || undefined 
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilter(prev => ({ 
      ...prev, 
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined 
    }));
  };

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setShowForm(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowForm(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    if (window.confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}? This action cannot be undone.`)) {
      try {
        await DataService.deleteStaff(staffId);
        loadStaff();
        onDataChange();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff member. Please try again.');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedStaff(null);
    loadStaff();
    onDataChange();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedStaff(null);
  };

  const getRoleColor = (role: StaffRole): string => {
    switch (role) {
      case StaffRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case StaffRole.MANAGER:
        return 'bg-yellow-100 text-yellow-800';
      case StaffRole.STAFF:
        return 'bg-green-100 text-green-800';
      case StaffRole.ASSISTANT:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: StaffRole.ADMIN, label: 'Administrator' },
    { value: StaffRole.MANAGER, label: 'Manager' },
    { value: StaffRole.STAFF, label: 'Staff' },
    { value: StaffRole.ASSISTANT, label: 'Assistant' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  if (loading) {
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
          <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage staff members, roles, and permissions</p>
        </div>
        <button
          onClick={handleAddStaff}
          className="btn-primary"
        >
          👥 Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by name or email..."
            onSearch={handleSearch}
          />
        </div>
        <FilterDropdown
          options={roleOptions}
          value={filter.role || ''}
          onChange={(value) => handleRoleFilter(value as StaffRole | '')}
          placeholder="Filter by role"
        />
        <FilterDropdown
          options={statusOptions}
          value={filter.isActive === true ? 'active' : filter.isActive === false ? 'inactive' : ''}
          onChange={handleStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {staff.length === 0 ? 'No staff members yet' : 'No staff match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {staff.length === 0 
              ? 'Start by adding your first staff member.' 
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {staff.length === 0 && (
            <button
              onClick={handleAddStaff}
              className="btn-primary"
            >
              Add First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.department || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member.hireDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleEditStaff(member)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <StaffForm
                staff={selectedStaff}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}