'use client';

import { useState } from 'react';
import LoginForm from '../components/loginForm';
import SignupForm from '../components/signupForm';
import { LOGIN_STRINGS } from '../lang/en/messages';

export default function Page() {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const pageTitle = LOGIN_STRINGS.PAGE_TITLE;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-deep-mahogany py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-bold text-golden mb-4 font-dancing">
        {pageTitle}
      </h1>

      <div className="flex flex-col lg:flex-row max-w-4xl w-full space-y-8 lg:space-y-0 lg:space-x-8">
        <div className="hidden lg:flex flex-col justify-center w-full lg:w-1/2 pr-4">
          <blockquote className="text-lg italic text-light-gold border-l-4 border-saddle-brown pl-4">
            {LOGIN_STRINGS.QUOTE}
            <footer className="mt-2 text-sm text-light-gold">
              {LOGIN_STRINGS.QUOTE_AUTHOR}
            </footer>
          </blockquote>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="bg-rich-brown p-6 sm:p-8 rounded-lg shadow-md">
            {isLoginMode ? (
              <LoginForm onToggleMode={toggleMode} />
            ) : (
              <SignupForm onToggleMode={toggleMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}