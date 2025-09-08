'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Staff, StaffRole, DashboardStats } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StaffManagement from '@/components/admin/StaffManagement';
import AppSettings from '@/components/admin/AppSettings';
import BackupRestore from '@/components/admin/BackupRestore';

type AdminTab = 'overview' | 'staff' | 'settings' | 'backup';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboardStats = DataService.getDashboardStats();
      const staffData = await DataService.getStaff();
      
      setStats(dashboardStats);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', count: null },
    { id: 'staff', label: 'Staff Management', icon: '👥', count: staff.filter(s => s.isActive).length },
    { id: 'settings', label: 'App Settings', icon: '⚙️', count: null },
    { id: 'backup', label: 'Backup & Restore', icon: '💾', count: null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage staff, configure settings, and maintain your system</p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab stats={stats} staff={staff} />}
            {activeTab === 'staff' && <StaffManagement onDataChange={loadData} />}
            {activeTab === 'settings' && <AppSettings onDataChange={loadData} />}
            {activeTab === 'backup' && <BackupRestore onDataChange={loadData} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  stats: DashboardStats | null;
  staff: Staff[];
}

function OverviewTab({ stats, staff }: OverviewTabProps) {
  const { formatAmount } = useCurrency();
  
  if (!stats) return <div>Loading...</div>;

  const activeStaff = staff.filter(s => s.isActive);
  const adminCount = staff.filter(s => s.role === StaffRole.ADMIN && s.isActive).length;
  const managerCount = staff.filter(s => s.role === StaffRole.MANAGER && s.isActive).length;

  return (
    <div className="space-y-8">
      {/* Business Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <span className="text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatAmount(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <span className="text-xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatAmount(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <span className="text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingInvoices}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <span className="text-xl">👨‍💼</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Staff</p>
                <p className="text-2xl font-semibold text-gray-900">{activeStaff.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <span className="text-xl">🔑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-semibold text-gray-900">{adminCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <span className="text-xl">👨‍💼</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-semibold text-gray-900">{managerCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Staff Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Staff</h2>
        <div className="card">
          <div className="space-y-4">
            {activeStaff.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.role === StaffRole.ADMIN 
                      ? 'bg-red-100 text-red-800'
                      : member.role === StaffRole.MANAGER
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{member.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}