import { useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthHeaders {
  Authorization: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Add your authentication logic here
    // For example, check local storage or make an API call
    const checkAuth = async () => {
      try {
        // Simulated auth check
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    // Implement login logic
    // For example:
    // const response = await api.login(credentials);
    // setUser(response.user);
    // setToken(response.token);
    // localStorage.setItem('user', JSON.stringify(response.user));
    // localStorage.setItem('token', response.token);
  };

  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const getAuthHeaders = (): AuthHeaders | undefined => {
    if (token) {
      return {
        Authorization: `Bearer ${token}`
      };
    }
    return undefined;
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    getAuthHeaders,
  };
}
