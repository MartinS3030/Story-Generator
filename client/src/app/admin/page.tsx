'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_STRINGS } from '../lang/en/messages';

interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  api_calls: number;
}

interface Resource {
  method: string;
  endpoint: string;
  requests: number;
}

interface AdminData {
  isAdmin: boolean;
  users: User[];
}

interface ResourceData {
  resources: Resource[];
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/admin/data`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 200) {
        const userData: AdminData = await response.json();
        if (!userData.isAdmin) {
          router.push('/user');
        } else {
          setUsers(userData.users);
        }
      } else {
        router.push('/authenticate');
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/authenticate');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchResourceData = useCallback(async () => {
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/admin/resource`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 200) {
        const resourceData: ResourceData = await response.json();
        setResources(resourceData.resources);
      } else {
        console.error(ADMIN_STRINGS.RESOURCE_FETCH_ERROR);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
    fetchResourceData();
  }, [fetchAdminData, fetchResourceData]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        router.push('/authenticate');
      } else {
        alert(ADMIN_STRINGS.LOGOUT_FAILED);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert(ADMIN_STRINGS.LOGOUT_ERROR);
    }
  };

  const deleteUserById = async (userId: string, username: string) => {
    if (confirm(ADMIN_STRINGS.DELETE_USER_CONFIRMATION(username))) {
      try {
        const response = await fetch(`${APP_DOMAIN}/api/v1/admin/delete/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.status === 200) {
          const result = await response.json();
          alert(result.message);
          fetchAdminData();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(ADMIN_STRINGS.DELETE_USER_ERROR);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="flex flex-col items-center text-deep-mahogany">
          <div className="w-16 h-16 border-4 border-warm-beige border-t-golden rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <div className="bg-gradient-to-r from-saddle-brown to-rich-brown shadow-2xl border-b-4 border-golden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-warm-cream font-dancing">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-golden hover:bg-light-gold text-deep-mahogany font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span>{ADMIN_STRINGS.LOGOUT_BUTTON}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-warm-beige overflow-hidden">
            <div className="bg-gradient-to-r from-saddle-brown to-rich-brown p-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-warm-cream">
                  {ADMIN_STRINGS.USER_MANAGEMENT_TITLE}
                </h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-warm-beige">
                <thead className="bg-warm-beige">
                  <tr>
                    {ADMIN_STRINGS.USER_TABLE_HEADERS.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-sm font-bold text-deep-mahogany uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-warm-beige">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-rich-brown">
                        <div className="flex flex-col items-center space-y-3">
                          <svg className="w-12 h-12 text-saddle-brown opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className="text-lg font-medium">{ADMIN_STRINGS.NO_USERS_FOUND}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-warm-cream transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-mahogany">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-rich-brown">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-mahogany">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            user.is_admin 
                              ? 'bg-golden text-deep-mahogany' 
                              : 'bg-warm-beige text-saddle-brown'
                          }`}>
                            {user.is_admin ? ADMIN_STRINGS.ADMIN_STATUS.YES : ADMIN_STRINGS.ADMIN_STATUS.NO}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-rich-brown font-medium">
                          <span className="bg-light-gold px-2 py-1 rounded-md text-deep-mahogany">
                            {user.api_calls}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!user.is_admin && (
                            <button
                              onClick={() => deleteUserById(user.id, user.username)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-1"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3l1.5 1.5a1 1 0 01-1.414 1.414L10 10.414V6a1 1 0 011-1z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h1a1 1 0 000 2H5v11a2 2 0 002 2h6a2 2 0 002-2V5h-1a1 1 0 100-2h1a2 2 0 012 2v11a4 4 0 01-4 4H7a4 4 0 01-4-4V5z" clipRule="evenodd" />
                              </svg>
                              <span>{ADMIN_STRINGS.DELETE_BUTTON}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-2xl border-2 border-warm-beige overflow-hidden">
            <div className="bg-gradient-to-r from-saddle-brown to-rich-brown p-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-warm-cream">
                  {ADMIN_STRINGS.RESOURCE_MANAGEMENT_TITLE}
                </h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-warm-beige">
                <thead className="bg-warm-beige">
                  <tr>
                    {ADMIN_STRINGS.RESOURCE_TABLE_HEADERS.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-sm font-bold text-deep-mahogany uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-warm-beige">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-rich-brown">
                        <div className="flex flex-col items-center space-y-3">
                          <svg className="w-12 h-12 text-saddle-brown opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-lg font-medium">{ADMIN_STRINGS.NO_RESOURCES_FOUND}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource, index) => (
                      <tr key={index} className="hover:bg-warm-cream transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-mahogany">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            resource.method === 'GET' ? 'bg-green-100 text-green-800 border border-green-300' :
                            resource.method === 'POST' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            resource.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                            resource.method === 'DELETE' ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-warm-beige text-saddle-brown border border-saddle-brown'
                          }`}>
                            {resource.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-rich-brown font-mono bg-warm-cream">
                          <code className="px-2 py-1 bg-warm-beige rounded text-deep-mahogany">
                            {resource.endpoint}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-deep-mahogany font-bold">
                          <span className="bg-golden px-3 py-1 rounded-md text-deep-mahogany">
                            {resource.requests.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}