import { useState } from "react";

interface FormState {
  [key: string]: string | number | boolean;
}

export const useFormState = (initialState: FormState) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialState);
    setError(null);
  };

  const setFieldError = (message: string) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    formData,
    setFormData,
    handleChange,
    loading,
    setLoading,
    error,
    setFieldError,
    clearError,
    resetForm,
  };
};
