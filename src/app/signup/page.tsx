'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SIGNUP_STRINGS } from '../lang/en/messages';

interface SignupResponse {
  message?: string;
}

const APP_DOMAIN: string = process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:4000';

export default function Page() {
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
          router.push('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {SIGNUP_STRINGS.SIGNUP_HEADING}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                {SIGNUP_STRINGS.LABEL_FIRST_NAME}
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={handleInputChange(setFirstName)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {SIGNUP_STRINGS.LABEL_EMAIL}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={handleInputChange(setEmail)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {SIGNUP_STRINGS.LABEL_PASSWORD}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={handleInputChange(setPassword)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !!success}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : SIGNUP_STRINGS.BUTTON_SIGNUP}
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{SIGNUP_STRINGS.ACCOUNT_EXISTS} </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {SIGNUP_STRINGS.LOGIN_LINK_TEXT}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 