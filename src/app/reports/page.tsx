'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { DashboardStats } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/dashboard/StatsCard';

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setLoading(true);
    try {
      const dashboardStats = DataService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
            {/* Key Metrics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Total Revenue"
                  value={formatAmount(stats.totalRevenue)}
                  icon="💰"
                  color="green"
                />
                <StatsCard
                  title="Monthly Revenue"
                  value={formatAmount(stats.monthlyRevenue)}
                  icon="📈"
                  color="blue"
                />
                <StatsCard
                  title="Total Clients"
                  value={stats.totalClients}
                  icon="👥"
                  color="purple"
                />
                <StatsCard
                  title="Active Clients"
                  value={stats.activeClients}
                  icon="✅"
                  color="green"
                />
              </div>
            )}

            {/* Report Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Reports */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Client Reports</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">VIP Clients</span>
                    <span className="text-sm text-gray-600">{stats?.vipClients || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Active Clients</span>
                    <span className="text-sm text-gray-600">{stats?.activeClients || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Total Clients</span>
                    <span className="text-sm text-gray-600">{stats?.totalClients || 0}</span>
                  </div>
                </div>
              </div>

              {/* Service Reports */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Service Reports</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Scheduled Services</span>
                    <span className="text-sm text-gray-600">{stats?.scheduledServices || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Completed This Month</span>
                    <span className="text-sm text-gray-600">{stats?.completedServicesThisMonth || 0}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Reports */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Invoice Reports</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Pending Invoices</span>
                    <span className="text-sm text-gray-600">{stats?.pendingInvoices || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Overdue Invoices</span>
                    <span className="text-sm text-red-600">{stats?.overdueInvoices || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
                <div className="space-y-3">
                  <button className="w-full btn-secondary text-left">
                    📊 Export Client Report
                  </button>
                  <button className="w-full btn-secondary text-left">
                    📈 Export Revenue Report
                  </button>
                  <button className="w-full btn-secondary text-left">
                    📄 Export Invoice Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}