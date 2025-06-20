'use client';

import { useState, useEffect } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
    fetchResourceData();
  }, []);

  const fetchAdminData = async () => {
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
  };

  const fetchResourceData = async () => {
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
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {ADMIN_STRINGS.LOGOUT_BUTTON}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b-2 border-gray-200">
            {ADMIN_STRINGS.USER_MANAGEMENT_TITLE}
          </h2>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    {ADMIN_STRINGS.USER_TABLE_HEADERS.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {ADMIN_STRINGS.NO_USERS_FOUND}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_admin 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_admin ? ADMIN_STRINGS.ADMIN_STATUS.YES : ADMIN_STRINGS.ADMIN_STATUS.NO}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.api_calls}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!user.is_admin && (
                            <button
                              onClick={() => deleteUserById(user.id, user.username)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors duration-200"
                            >
                              {ADMIN_STRINGS.DELETE_BUTTON}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b-2 border-gray-200">
            {ADMIN_STRINGS.RESOURCE_MANAGEMENT_TITLE}
          </h2>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    {ADMIN_STRINGS.RESOURCE_TABLE_HEADERS.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        {ADMIN_STRINGS.NO_RESOURCES_FOUND}
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            resource.method === 'GET' ? 'bg-green-100 text-green-800' :
                            resource.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            resource.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            resource.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {resource.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {resource.endpoint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {resource.requests.toLocaleString()}
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