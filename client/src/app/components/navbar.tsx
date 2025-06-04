'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NAVBAR_STRINGS } from '../lang/en/messages';

interface NavbarProps {
  apicalls: number;
  id: string;
  username: string;
  onUsernameUpdate?: (newUsername: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ apicalls, id, username, onUsernameUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState(username);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/v1/logout`, {
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        router.push('/login');
      } else {
        alert(NAVBAR_STRINGS.LOGOUT_FAILED);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert(NAVBAR_STRINGS.LOGOUT_ERROR);
    }
  };

  const handleUsernameSubmit = async () => {
    if (!newUsername.trim()) {
      alert(NAVBAR_STRINGS.EMPTY_USERNAME_ERROR);
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/v1/update/${id}`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
        }),
        credentials: "include",
      });
  
      const userData = await response.json();

      if (response.status === 200) {
        setIsModalOpen(false);
        alert(userData.message || NAVBAR_STRINGS.UPDATE_SUCCESS);
        setCurrentUsername(newUsername);
        onUsernameUpdate?.(newUsername);
        setNewUsername('');
      } else {
        alert(userData.message || "User update failed");
      }
    } catch (error) {
      alert(NAVBAR_STRINGS.UPDATE_ERROR);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewUsername('');
  };

  return (
    <>
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-lg font-semibold text-gray-900">
                {NAVBAR_STRINGS.API_CALLS_LEFT}{apicalls}
              </span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <span className="text-gray-700">
                  {NAVBAR_STRINGS.HELLO_USER}{currentUsername}!
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {NAVBAR_STRINGS.CHANGE_USERNAME}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {NAVBAR_STRINGS.LOGOUT}
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <div className="text-gray-700 px-3 py-2 text-sm">
                {NAVBAR_STRINGS.HELLO_USER}{currentUsername}!
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="text-blue-600 hover:text-blue-800 block px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors"
              >
                {NAVBAR_STRINGS.CHANGE_USERNAME}
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 block px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors"
              >
                {NAVBAR_STRINGS.LOGOUT}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {NAVBAR_STRINGS.MODAL_TITLE}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-2">
              <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-2">
                {NAVBAR_STRINGS.NEW_USERNAME_LABEL}
              </label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                {NAVBAR_STRINGS.CANCEL_BUTTON}
              </button>
              <button
                onClick={handleUsernameSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {NAVBAR_STRINGS.SUBMIT_BUTTON}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;