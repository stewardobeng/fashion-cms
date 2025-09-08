'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/utils';
import { Currency } from '@/types';

export function useCurrency() {
  const { settings } = useSettings();
  
  const formatAmount = (amount: number): string => {
    const currency = settings?.currency || Currency.USD;
    return formatCurrency(amount, currency);
  };

  const getCurrency = (): Currency => {
    return settings?.currency || Currency.USD;
  };

  const getTaxRate = (): number => {
    return settings?.taxRate || 0;
  };

  return {
    formatAmount,
    getCurrency,
    getTaxRate,
    settings
  };
}