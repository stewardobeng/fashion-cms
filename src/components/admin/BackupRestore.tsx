'use client';

import { useState } from 'react';
import { DataService } from '@/lib/data-service';
import { BackupData } from '@/types';
import { formatDate } from '@/utils';

interface BackupRestoreProps {
  onDataChange?: () => void;
}

export default function BackupRestore({ onDataChange }: BackupRestoreProps) {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const backupJson = DataService.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fashion-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData: BackupData = JSON.parse(content);
        handleRestoreBackup(backupData);
      } catch (error) {
        setRestoreError('Invalid backup file format. Please select a valid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreBackup = async (backupData: BackupData) => {
    setIsRestoring(true);
    setRestoreError(null);
    setRestoreSuccess(false);

    try {
      const success = DataService.restoreFromBackup(backupData);
      if (success) {
        setRestoreSuccess(true);
        onDataChange?.();
        // Reload the page after a short delay to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setRestoreError('Failed to restore backup. The backup file may be corrupted or incompatible.');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      setRestoreError('An error occurred while restoring the backup. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
      DataService.clearAllData();
      onDataChange?.();
      setShowConfirmClear(false);
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const getCurrentDataStats = () => {
    try {
      const backup = DataService.createBackup();
      return {
        clients: backup.data.clients?.length || 0,
        services: backup.data.services?.length || 0,
        invoices: backup.data.invoices?.length || 0,
        payments: backup.data.payments?.length || 0,
        staff: backup.data.staff?.length || 0,
        measurements: backup.data.measurements?.length || 0,
        measurementSets: backup.data.measurementSets?.length || 0,
      };
    } catch (error) {
      return null;
    }
  };

  const dataStats = getCurrentDataStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Backup & Restore</h2>
        <p className="text-gray-600 mt-1">Manage your data backups and restore from previous backups</p>
      </div>

      {/* Messages */}
      {restoreError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="text-red-400 mr-3 mt-0.5">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Restore Failed</h3>
              <p className="text-sm text-red-700 mt-1">{restoreError}</p>
            </div>
          </div>
        </div>
      )}

      {restoreSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="text-green-400 mr-3 mt-0.5">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800">Restore Successful</h3>
              <p className="text-sm text-green-700 mt-1">Your data has been successfully restored. The page will reload shortly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Data Overview */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Data Overview</h3>
          
          {dataStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dataStats.clients}</div>
                <div className="text-sm text-blue-700">Clients</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dataStats.services}</div>
                <div className="text-sm text-green-700">Services</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{dataStats.invoices}</div>
                <div className="text-sm text-yellow-700">Invoices</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dataStats.payments}</div>
                <div className="text-sm text-purple-700">Payments</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{dataStats.staff}</div>
                <div className="text-sm text-indigo-700">Staff</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{dataStats.measurements}</div>
                <div className="text-sm text-pink-700">Measurements</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{dataStats.measurementSets}</div>
                <div className="text-sm text-orange-700">Measurement Sets</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Unable to load data statistics
            </div>
          )}
        </div>
      </div>

      {/* Create Backup */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Backup</h3>
              <p className="text-gray-600 mb-4">
                Download a complete backup of all your data including clients, services, invoices, payments, staff, and settings.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Includes all client and service data</li>
                <li>• Contains invoice and payment records</li>
                <li>• Preserves staff and permission settings</li>
                <li>• Saves application configuration</li>
                <li>• Includes measurement data</li>
              </ul>
            </div>
            <div className="ml-6">
              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="btn-primary flex items-center space-x-2"
              >
                <span className="text-lg">💾</span>
                <span>{isCreatingBackup ? 'Creating...' : 'Download Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Backup */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Restore from Backup</h3>
              <p className="text-gray-600 mb-4">
                Upload a backup file to restore your data. This will replace all current data with the backup content.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <div className="flex items-start">
                  <div className="text-amber-400 mr-2 mt-0.5">
                    <span className="text-sm">⚠️</span>
                  </div>
                  <div className="text-sm text-amber-700">
                    <strong>Warning:</strong> Restoring from a backup will replace all existing data. 
                    Consider creating a backup of your current data first.
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <label className="btn-secondary cursor-pointer flex items-center space-x-2">
                <span className="text-lg">📤</span>
                <span>{isRestoring ? 'Restoring...' : 'Select Backup File'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={isRestoring}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
          <p className="text-red-600 mb-4">
            Permanently delete all data from the system. This action cannot be undone.
          </p>
          
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="btn-danger"
            >
              🗑️ Clear All Data
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700 font-medium">
                  Are you absolutely sure? This will permanently delete:
                </p>
                <ul className="text-sm text-red-600 mt-2 ml-4 list-disc">
                  <li>All client records and data</li>
                  <li>All service definitions</li>
                  <li>All invoices and payment records</li>
                  <li>All staff accounts and permissions</li>
                  <li>All measurements and measurement sets</li>
                  <li>All application settings</li>
                </ul>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearAllData}
                  className="btn-danger"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backup Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">📋 Backup Best Practices</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium min-w-0 flex-shrink-0">1.</span>
              <span>Create regular backups, especially before making significant changes to your data or settings.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium min-w-0 flex-shrink-0">2.</span>
              <span>Store backup files in a secure location, such as cloud storage or external drives.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium min-w-0 flex-shrink-0">3.</span>
              <span>Test your backups periodically by restoring them in a test environment.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium min-w-0 flex-shrink-0">4.</span>
              <span>Keep multiple backup versions to protect against corruption or accidental changes.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium min-w-0 flex-shrink-0">5.</span>
              <span>Backup files contain sensitive business data - handle them with appropriate security measures.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}