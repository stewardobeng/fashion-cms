'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/lib/data-service';
import { Invoice, CreatePaymentData, ValidationError, PaymentMethod } from '@/types';
import { formatCurrency, getCurrentISOString } from '@/utils';

interface PaymentFormProps {
  invoice: Invoice;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ invoice, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState<CreatePaymentData>({
    invoiceId: invoice.id,
    clientId: invoice.clientId,
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate remaining balance
  const remainingBalance = invoice.total - invoice.paidAmount;
  const maxPaymentAmount = Math.max(0, remainingBalance);

  useEffect(() => {
    // Set default amount to remaining balance
    setFormData(prev => ({
      ...prev,
      amount: maxPaymentAmount,
    }));
  }, [maxPaymentAmount]);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!formData.amount || formData.amount <= 0) {
      validationErrors.push({ field: 'amount', message: 'Payment amount is required and must be greater than 0' });
    }

    if (formData.amount > remainingBalance + 0.01) { // Allow small floating point differences
      validationErrors.push({ 
        field: 'amount', 
        message: `Payment amount cannot exceed remaining balance of ${formatCurrency(remainingBalance)}` 
      });
    }

    if (!formData.paymentMethod) {
      validationErrors.push({ field: 'paymentMethod', message: 'Payment method is required' });
    }

    if (!formData.paymentDate) {
      validationErrors.push({ field: 'paymentDate', message: 'Payment date is required' });
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await DataService.createPayment(formData);
      onSubmit();
    } catch (error) {
      console.error('Error creating payment:', error);
      setErrors([{ field: 'general', message: 'Failed to record payment. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setFullPayment = () => {
    setFormData(prev => ({
      ...prev,
      amount: maxPaymentAmount,
    }));
  };

  const setPartialPayment = (percentage: number) => {
    const amount = Math.round((maxPaymentAmount * percentage) * 100) / 100;
    setFormData(prev => ({
      ...prev,
      amount,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error message */}
      {getFieldError('general') && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
          {getFieldError('general')}
        </div>
      )}

      {/* Invoice Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Invoice Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Invoice Number:</span>
            <span className="font-medium">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-medium">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span className="font-medium">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Remaining Balance:</span>
            <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Payment Buttons */}
      {remainingBalance > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Payment Options
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setFullPayment}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Full Payment ({formatCurrency(remainingBalance)})
            </button>
            <button
              type="button"
              onClick={() => setPartialPayment(0.5)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              50% ({formatCurrency(remainingBalance * 0.5)})
            </button>
            <button
              type="button"
              onClick={() => setPartialPayment(0.25)}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              25% ({formatCurrency(remainingBalance * 0.25)})
            </button>
          </div>
        </div>
      )}

      {/* Payment Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Amount *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            max={remainingBalance}
            step="0.01"
            value={formData.amount}
            onChange={handleInputChange}
            className={`input-field pl-7 ${getFieldError('amount') ? 'input-error' : ''}`}
            placeholder="0.00"
          />
        </div>
        {getFieldError('amount') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('amount')}</p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method *
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          className={`input-field ${getFieldError('paymentMethod') ? 'input-error' : ''}`}
        >
          <option value={PaymentMethod.CASH}>Cash</option>
          <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
          <option value={PaymentMethod.DEBIT_CARD}>Debit Card</option>
          <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
          <option value={PaymentMethod.CHECK}>Check</option>
          <option value={PaymentMethod.DIGITAL_WALLET}>Digital Wallet</option>
        </select>
        {getFieldError('paymentMethod') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('paymentMethod')}</p>
        )}
      </div>

      {/* Payment Date */}
      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Date *
        </label>
        <input
          type="date"
          id="paymentDate"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={handleInputChange}
          className={`input-field ${getFieldError('paymentDate') ? 'input-error' : ''}`}
        />
        {getFieldError('paymentDate') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('paymentDate')}</p>
        )}
      </div>

      {/* Reference */}
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Reference
        </label>
        <input
          type="text"
          id="reference"
          name="reference"
          value={formData.reference}
          onChange={handleInputChange}
          className="input-field"
          placeholder="Transaction ID, Check number, etc."
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional: Add a reference number or transaction ID for this payment
        </p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          className="input-field"
          placeholder="Add any notes about this payment..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || remainingBalance <= 0}
        >
          {isSubmitting ? 'Recording...' : 'Record Payment'}
        </button>
      </div>

      {remainingBalance <= 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-700 text-sm text-center">
          ✅ This invoice has been fully paid
        </div>
      )}
    </form>
  );
}