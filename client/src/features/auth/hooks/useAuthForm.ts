import { useState } from "react";
import { LoginForm, RegisterForm, SellerRegisterForm } from "@/types/global";

interface UseAuthFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Record<string, string>;
}

interface UseAuthFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isLoading: boolean;
  isSubmitting: boolean;
  handleChange: (name: keyof T, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  resetForm: () => void;
}

export const useAuthForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseAuthFormProps<T>): UseAuthFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors((prev) => ({ ...prev, [name as string]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Run validation if provided
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      setIsLoading(true);
      await onSubmit(values);
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field as string]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsLoading(false);
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldError,
    clearErrors,
    resetForm,
  };
};

// Validation functions
export const validateLoginForm = (
  values: LoginForm
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

export const validateRegisterForm = (
  values: RegisterForm | SellerRegisterForm
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.firstName) {
    errors.firstName = "First name is required";
  } else if (values.firstName.length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!values.lastName) {
    errors.lastName = "Last name is required";
  } else if (values.lastName.length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    errors.password = "Password must contain uppercase, lowercase, and number";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (values.phone && !/^[6-9]\d{9}$/.test(values.phone)) {
    errors.phone = "Please enter a valid Indian mobile number";
  }

  // Seller-specific validation
  if (values.role === "seller" && "businessName" in values) {
    const sellerValues = values as SellerRegisterForm;

    if (!sellerValues.businessName) {
      errors.businessName = "Business name is required";
    } else if (sellerValues.businessName.length < 2) {
      errors.businessName = "Business name must be at least 2 characters";
    }

    if (!sellerValues.businessType) {
      errors.businessType = "Business type is required";
    }

    if (!sellerValues.businessAddress) {
      errors.businessAddress = "Business address is required";
    } else if (sellerValues.businessAddress.length < 10) {
      errors.businessAddress = "Please provide a complete business address";
    }

    if (
      sellerValues.businessPhone &&
      !/^[6-9]\d{9}$/.test(sellerValues.businessPhone)
    ) {
      errors.businessPhone = "Please enter a valid business phone number";
    }

    if (sellerValues.taxId && sellerValues.taxId.length < 6) {
      errors.taxId = "Please enter a valid tax ID";
    }
  }

  return errors;
};
