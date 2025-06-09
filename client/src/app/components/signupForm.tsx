'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SIGNUP_STRINGS } from '../lang/en/messages';

interface SignupResponse {
  message?: string;
}

interface SignupFormProps {
  onToggleMode: () => void;
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function SignupForm({ onToggleMode }: SignupFormProps) {
  const [firstName, setFirstName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

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
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setter(e.target.value);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl text-center text-golden font-dancing">
          {SIGNUP_STRINGS.SIGNUP_HEADING}
        </h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-warm-beige mb-1">
            {SIGNUP_STRINGS.LABEL_FIRST_NAME}
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={handleInputChange(setFirstName)}
            className="w-full px-3 py-2 border rounded-md shadow-sm input-custom"
            disabled={isLoading}
          />
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
            onChange={handleInputChange(setEmail)}
            className="w-full px-3 py-2 border rounded-md shadow-sm input-custom"
            disabled={isLoading}
          />
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
            onChange={handleInputChange(setPassword)}
            className="w-full px-3 py-2 border rounded-md shadow-sm input-custom"
            disabled={isLoading}
          />
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
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !!success}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : SIGNUP_STRINGS.BUTTON_SIGNUP}
        </button>
      </div>
      
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