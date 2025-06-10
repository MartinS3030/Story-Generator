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

  const handleGenerateStory = () => {
    router.push('/user');
  };

  const handleViewStories = () => {
    router.push('/savedStories');
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-deep-mahogany via-rich-brown to-saddle-brown shadow-lg border-b-2 border-golden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-deep-mahogany" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-warm-cream font-bold text-lg">
                    {apicalls}
                  </span>
                  <p className="text-light-gold text-sm">
                    {NAVBAR_STRINGS.API_CALLS_LEFT.replace(`${apicalls}`, '').trim()}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGenerateStory}
                  className="bg-transparent border-2 border-light-gold hover:bg-light-gold hover:text-deep-mahogany text-light-gold px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Generate Story</span>
                </button>
                
                <button
                  onClick={handleViewStories}
                  className="bg-transparent border-2 border-light-gold hover:bg-light-gold hover:text-deep-mahogany text-light-gold px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span>Saved Stories</span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-light-gold rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-deep-mahogany" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-warm-cream font-medium">
                    {NAVBAR_STRINGS.HELLO_USER}{currentUsername}!
                  </span>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-golden hover:bg-light-gold text-deep-mahogany px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>{NAVBAR_STRINGS.CHANGE_USERNAME}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-transparent border-2 border-warm-cream hover:bg-warm-cream hover:text-deep-mahogany text-warm-cream px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>{NAVBAR_STRINGS.LOGOUT}</span>
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-warm-cream hover:text-golden hover:bg-rich-brown focus:outline-none focus:ring-2 focus:ring-inset focus:ring-golden transition-colors"
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

          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
            <div className="px-2 pt-4 pb-3 space-y-3 border-t border-golden border-opacity-30">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-8 h-8 bg-light-gold rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-deep-mahogany" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-warm-cream font-medium">
                  {NAVBAR_STRINGS.HELLO_USER}{currentUsername}!
                </span>
              </div>
              
              <button
                onClick={() => {
                  handleGenerateStory();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left border-2 border-light-gold hover:bg-light-gold hover:text-deep-mahogany text-light-gold px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md flex items-center space-x-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Generate Story</span>
              </button>
              
              <button
                onClick={() => {
                  handleViewStories();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left border-2 border-light-gold hover:bg-light-gold hover:text-deep-mahogany text-light-gold px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md flex items-center space-x-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Saved Stories</span>
              </button>
              
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left bg-golden hover:bg-light-gold text-deep-mahogany px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md flex items-center space-x-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>{NAVBAR_STRINGS.CHANGE_USERNAME}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full text-left border-2 border-warm-cream hover:bg-warm-cream hover:text-deep-mahogany text-warm-cream px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md flex items-center space-x-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>{NAVBAR_STRINGS.LOGOUT}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 bg-deep-mahogany bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-golden overflow-hidden">
              <div className="bg-gradient-to-r from-saddle-brown to-rich-brown p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-deep-mahogany" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-warm-cream">
                      {NAVBAR_STRINGS.MODAL_TITLE}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-warm-cream hover:text-golden transition-colors p-1 rounded-lg hover:bg-deep-mahogany hover:bg-opacity-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="newUsername" className="block text-sm font-semibold text-deep-mahogany mb-3">
                    {NAVBAR_STRINGS.NEW_USERNAME_LABEL}
                  </label>
                  <input
                    type="text"
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input-custom w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-golden transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                    autoFocus
                    placeholder="Enter your new username..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-warm-beige border-2 border-saddle-brown text-rich-brown rounded-lg hover:bg-saddle-brown hover:text-warm-cream transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    {NAVBAR_STRINGS.CANCEL_BUTTON}
                  </button>
                  <button
                    onClick={handleUsernameSubmit}
                    className="btn-primary px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {NAVBAR_STRINGS.SUBMIT_BUTTON}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;