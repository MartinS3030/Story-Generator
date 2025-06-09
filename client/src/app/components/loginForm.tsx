'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LOGIN_STRINGS } from '../lang/en/messages';
import { validateEmail, validateRequired } from '../util/util';

interface LoginResponse {
  isAdmin: boolean;
  message?: string;
}

interface LoginFormProps {
  onToggleMode: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    const passwordValidation = validateRequired(password, 'Password');
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (response.status === 200) {
        if (data.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      } else {
        setError(data.message || LOGIN_STRINGS.LOGIN_FAILED);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(LOGIN_STRINGS.GENERIC_ERROR);
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
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl text-center text-golden font-dancing">
          {LOGIN_STRINGS.LOGIN_HEADING}
        </h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-warm-beige mb-1">
            {LOGIN_STRINGS.EMAIL_LABEL}
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
            {LOGIN_STRINGS.PASSWORD_LABEL}
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
          {validationErrors.password && (
            <p className="text-sm text-red-400 mt-1">{validationErrors.password}</p>
          )}
        </div>

        {error && (
          <div className="text-sm text-center text-golden bg-red-900/20 p-3 rounded-md border border-red-800/30">
            {error}
          </div>
        )}
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : LOGIN_STRINGS.LOGIN_BUTTON}
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-warm-beige">{LOGIN_STRINGS.NO_ACCOUNT_MESSAGE} </span>
        <button 
          onClick={onToggleMode}
          className="font-medium text-golden hover:text-light-gold cursor-pointer bg-transparent border-none"
        >
          {LOGIN_STRINGS.SIGNUP_LINK}
        </button>
      </div>
    </>
  );
}