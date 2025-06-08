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
    <div className="min-h-screen flex flex-col items-center justify-center bg-deep-mahogany py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-center text-golden font-dancing mb-8">
        {LOGIN_STRINGS.PAGE_TITLE}
      </h1>

      <div className="flex flex-col lg:flex-row max-w-4xl w-full space-y-8 lg:space-y-0 lg:space-x-8">
        <div className="hidden lg:flex flex-col justify-center w-full lg:w-1/2 pr-4">
          <blockquote className="text-lg italic text-light-gold border-l-4 border-saddle-brown pl-4">
            {LOGIN_STRINGS.QUOTE}
            <footer className="mt-2 text-sm text-light-gold">{LOGIN_STRINGS.QUOTE_AUTHOR}</footer>
          </blockquote>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="bg-rich-brown p-6 sm:p-8 rounded-lg shadow-md">
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
                  onChange={handleInputChange(setEmail)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm input-custom"
                  disabled={isLoading}
                />
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
                  onChange={handleInputChange(setPassword)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm input-custom"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-center text-golden">
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
              <Link href="/signup" className="font-medium text-golden hover:text-light-gold">
                {LOGIN_STRINGS.SIGNUP_LINK}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}