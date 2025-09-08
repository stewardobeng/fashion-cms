import { useState } from 'react';
import { ValidationError } from '@/types';

interface UseFormStateOptions<T> {
  initialData: T;
  validate?: (data: T) => ValidationError[];
}

interface UseFormStateReturn<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
  setData: (data: T | ((prev: T) => T)) => void;
  setErrors: (errors: ValidationError[]) => void;
  setSubmitting: (submitting: boolean) => void;
  getFieldError: (fieldName: string) => string | undefined;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  reset: () => void;
  validateForm: () => boolean;
}

export function useFormState<T extends Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateReturn<T> {
  const { initialData, validate } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setSubmitting] = useState(false);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setData(prev => {
      if (type === 'checkbox') {
        const target = e.target as HTMLInputElement;
        return { ...prev, [name]: target.checked };
      } else if (type === 'number') {
        return { ...prev, [name]: parseFloat(value) || 0 };
      } else {
        return { ...prev, [name]: value };
      }
    });
    
    // Clear field error when user starts typing
    if (errors.some(e => e.field === name)) {
      setErrors(prev => prev.filter(e => e.field !== name));
    }
  };

  const validateForm = (): boolean => {
    if (validate) {
      const validationErrors = validate(data);
      setErrors(validationErrors);
      return validationErrors.length === 0;
    }
    return true;
  };

  const reset = () => {
    setData(initialData);
    setErrors([]);
    setSubmitting(false);
  };

  const isValid = errors.length === 0;

  return {
    data,
    errors,
    isSubmitting,
    isValid,
    setData,
    setErrors,
    setSubmitting,
    getFieldError,
    handleInputChange,
    reset,
    validateForm,
  };
}