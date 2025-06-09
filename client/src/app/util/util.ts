export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }
  if (!hasUppercase) {
    errors.push('one uppercase letter');
  }
  if (!hasLowercase) {
    errors.push('one lowercase letter');
  }
  if (!hasNumber) {
    errors.push('one number');
  }
  if (!hasSymbol) {
    errors.push('one symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: `Password must contain ${errors.join(', ')}`
    };
  }

  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const getPasswordStrength = (password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
} => {
  if (!password) return { level: 'weak', score: 0 };

  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  if (password.length >= 16) score += 1;
  
  if (score < 3) return { level: 'weak', score };
  if (score < 5) return { level: 'medium', score };
  if (score < 6) return { level: 'strong', score };
  return { level: 'very-strong', score };
};