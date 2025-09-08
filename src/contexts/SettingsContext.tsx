'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataService } from '@/lib/data-service';
import { AppSettings, UpdateAppSettingsData } from '@/types';

interface SettingsContextType {
  settings: AppSettings | null;
  updateSettings: (data: UpdateAppSettingsData) => Promise<void>;
  refreshSettings: () => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const appSettings = await DataService.getSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading app settings:', error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (data: UpdateAppSettingsData): Promise<void> => {
    try {
      await DataService.updateSettings(data);
      // Reload settings to get the updated data
      const updatedSettings = await DataService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating app settings:', error);
      throw error;
    }
  };

  const refreshSettings = () => {
    loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    refreshSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}