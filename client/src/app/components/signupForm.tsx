'use client';

import { useState, FormEvent } from 'react';
import { SIGNUP_STRINGS } from '../lang/en/messages';
import { validateEmail, validatePassword, validateRequired, getPasswordStrength } from '../util/util';

interface SignupResponse {
  message?: string;
}

interface SignupFormProps {
  onToggleMode: () => void;
}

interface ValidationErrors {
  firstName?: string;
  email?: string;
  password?: string;
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function SignupForm({ onToggleMode }: SignupFormProps) {
  const [firstName, setFirstName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPasswordStrength, setShowPasswordStrength] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const firstNameValidation = validateRequired(firstName, 'First name');
    if (!firstNameValidation.isValid) {
      errors.firstName = firstNameValidation.message;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: firstName,
          email,
          password,
        }),
      });

      const data: SignupResponse = await response.json();

      if (response.status === 201) {
        setSuccess(data.message || SIGNUP_STRINGS.SIGNUP_SUCCESS);

        setTimeout(() => {
          onToggleMode();
        }, 2000);
      } else {
        setError(data.message || SIGNUP_STRINGS.SIGNUP_FAILED);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(SIGNUP_STRINGS.SIGNUP_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    fieldName: keyof ValidationErrors
  ) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setter(value);

    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }

    if (fieldName === 'password') {
      setShowPasswordStrength(value.length > 0);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthColor = (level: string): string => {
    switch (level) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = (score: number): string => {
    return `${(score / 7) * 100}%`;
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl text-center text-golden font-dancing">
          {SIGNUP_STRINGS.SIGNUP_HEADING}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-warm-beige mb-1">
            {SIGNUP_STRINGS.LABEL_FIRST_NAME}
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={handleInputChange(setFirstName, 'firstName')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm input-custom ${
              validationErrors.firstName ? 'border-red-500 focus:border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {validationErrors.firstName && (
            <p className="text-sm text-red-400 mt-1">{validationErrors.firstName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-warm-beige mb-1">
            {SIGNUP_STRINGS.LABEL_EMAIL}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={handleInputChange(setEmail, 'email')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm input-custom ${
              validationErrors.email ? 'border-red-500 focus:border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-400 mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-warm-beige mb-1">
            {SIGNUP_STRINGS.LABEL_PASSWORD}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={handleInputChange(setPassword, 'password')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm input-custom ${
              validationErrors.password ? 'border-red-500 focus:border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          
          {showPasswordStrength && password && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-warm-beige mb-1">
                <span>Password strength</span>
                <span className="capitalize">{passwordStrength.level.replace('-', ' ')}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.level)}`}
                  style={{ width: getStrengthWidth(passwordStrength.score) }}
                ></div>
              </div>
            </div>
          )}
          
          {validationErrors.password && (
            <p className="text-sm text-red-400 mt-1">{validationErrors.password}</p>
          )}
        </div>

        {error && (
          <div className="text-sm text-center text-golden bg-red-900/20 p-3 rounded-md border border-red-800/30">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-center text-golden bg-green-900/20 p-3 rounded-md border border-green-800/30">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !!success}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : SIGNUP_STRINGS.BUTTON_SIGNUP}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-warm-beige">{SIGNUP_STRINGS.ACCOUNT_EXISTS} </span>
        <button 
          onClick={onToggleMode}
          className="font-medium text-golden hover:text-light-gold cursor-pointer bg-transparent border-none"
        >
          {SIGNUP_STRINGS.LOGIN_LINK_TEXT}
        </button>
      </div>
    </>
  );
}