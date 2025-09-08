'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/init');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
        if (!data.data.needsInit) {
          setTimeout(() => router.push('/'), 2000);
        }
      } else {
        setError(data.error || 'Failed to check database status');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setInitializing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        await checkDatabaseStatus();
      } else {
        setError(data.error || 'Failed to initialize database');
      }
    } catch (err) {
      setError('Failed to initialize database');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Database Status</h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={checkDatabaseStatus} className="w-full btn-secondary">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!status?.needsInit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Ready!</h2>
            <p className="text-gray-600 mb-6">Redirecting to application...</p>
            <button onClick={() => router.push('/')} className="w-full btn-primary">
              Go to Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-blue-500 text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Fashion CMS Setup</h1>
          
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Database Connection</span>
              <span className={status?.connection ? 'text-green-600' : 'text-red-600'}>
                {status?.connection ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Database Tables</span>
              <span className={status?.tablesExist ? 'text-green-600' : 'text-yellow-600'}>
                {status?.tablesExist ? '✅' : '⏳'}
              </span>
            </div>
          </div>
          
          <button
            onClick={initializeDatabase}
            disabled={initializing || !status?.connection}
            className="w-full btn-primary mb-4 disabled:opacity-50"
          >
            {initializing ? 'Initializing...' : 'Initialize Database'}
          </button>
          
          <button onClick={checkDatabaseStatus} className="w-full btn-secondary">
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}