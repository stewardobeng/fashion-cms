'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { DashboardStats } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/dashboard/StatsCard';

export default function HomePage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data on first load
    DataService.initializeSampleData();
    
    // Load dashboard stats
    const dashboardStats = DataService.getDashboardStats();
    setStats(dashboardStats);
    setLoading(false);
  }, []);

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
      
      <div className="flex-1 transition-all duration-300 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Fashion Client Management
              </h1>
              <p className="text-gray-600">
                Manage your clients, services, and invoices efficiently
              </p>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Total Clients"
                  value={stats.totalClients}
                  icon="👥"
                  color="blue"
                />
                <StatsCard
                  title="Active Clients"
                  value={stats.activeClients}
                  icon="✅"
                  color="green"
                />
                <StatsCard
                  title="VIP Clients"
                  value={stats.vipClients}
                  icon="⭐"
                  color="yellow"
                />
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
                  title="Pending Invoices"
                  value={stats.pendingInvoices}
                  icon="📄"
                  color="orange"
                />
                <StatsCard
                  title="Overdue Invoices"
                  value={stats.overdueInvoices}
                  icon="⚠️"
                  color="red"
                />
                <StatsCard
                  title="Scheduled Services"
                  value={stats.scheduledServices}
                  icon="📅"
                  color="purple"
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/clients')}
                    className="w-full btn-primary text-left"
                  >
                    👥 Add New Client
                  </button>
                  <button 
                    onClick={() => router.push('/client-services')}
                    className="w-full btn-secondary text-left"
                  >
                    📅 Schedule Service
                  </button>
                  <button 
                    onClick={() => router.push('/invoices')}
                    className="w-full btn-secondary text-left"
                  >
                    💰 View Invoices
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">• New client Emma Johnson added</p>
                  <p className="mb-2">• Invoice #INV-001 generated</p>
                  <p className="mb-2">• Service completed for Sophia Williams</p>
                  <p>• Payment received from client</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Storage</span>
                    <span className="status-badge text-green-600 bg-green-100">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm text-gray-500">Auto-saved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}