'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LOGIN_STRINGS } from '../lang/en/messages'

interface LoginResponse {
  isAdmin: boolean;
  message?: string;
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setter(e.target.value);
  };

return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
      {LOGIN_STRINGS.PAGE_TITLE}
    </h1>

    <div className="flex flex-col lg:flex-row max-w-4xl w-full space-y-8 lg:space-y-0 lg:space-x-8">
      <div className="hidden lg:flex flex-col justify-center w-full lg:w-1/2 pr-4">
        <blockquote className="text-lg italic text-gray-700 border-l-4 border-blue-500 pl-4">
          {LOGIN_STRINGS.QUOTE}
          <footer className="mt-2 text-sm text-gray-500">{LOGIN_STRINGS.QUOTE_AUTHOR}</footer>
        </blockquote>
      </div>

      <div className="w-full lg:w-1/2">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {LOGIN_STRINGS.LOGIN_HEADING}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {LOGIN_STRINGS.EMAIL_LABEL}
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
                {LOGIN_STRINGS.PASSWORD_LABEL}
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
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : LOGIN_STRINGS.LOGIN_BUTTON}
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{LOGIN_STRINGS.NO_ACCOUNT_MESSAGE} </span>
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              {LOGIN_STRINGS.SIGNUP_LINK}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);
} 