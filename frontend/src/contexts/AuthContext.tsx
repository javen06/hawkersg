import React, { createContext, useContext, useState, useEffect } from 'react';

<<<<<<< Updated upstream
// Define the API base URL.
const API_BASE_URL = 'http://localhost:8001';

// Define the storage keys
const TOKEN_KEY = 'hawkersg_auth_token';
const USER_KEY = 'hawkersg_user_data';
=======
export const API_BASE_URL = 'http://localhost:8001';
export const TOKEN_KEY = 'hawkersg_auth_token';
export const USER_KEY = 'hawkersg_user_data';
>>>>>>> Stashed changes

export interface User {
  id: string;
  email: string;
  username: string;
  user_type: 'consumer' | 'business';
  created_at: string;
  profile_pic?: string;
  recentlySearch?: string;
<<<<<<< Updated upstream
=======
  license_number?: string;
  stall_name?: string;
  licensee_name?: string;
  establishment_address?: string;
  hawker_centre?: string;
  postal_code?: string;
  description?: string;
  status?: string;
  uen?: string;
>>>>>>> Stashed changes
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  businessLogin: (email: string, password: string, userType: 'consumer' | 'business') => Promise<void>;
  signup: (email: string, password: string, name: string, user_type: 'consumer' | 'business') => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

<<<<<<< Updated upstream
  useEffect(() => {
    setLoading(false);
  }, []);

  // MOCK ONLY
  const businessLogin = async (email: string, password: string, userType: 'consumer' | 'business') => {
    setLoading(true);
    try {
      // Mock authentication - replace with real auth
      const mockUser: User = {
        id: `${userType}_${Date.now()}`,
        email,
        username: email.split('@')[0],
        user_type: userType,
        created_at: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem('hawker_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };


  // --- LOGIN ---
  const login = async (email: string, password: string): Promise<void> => {
    const url = `${API_BASE_URL}/consumer/login`;

=======
  useEffect(() => setLoading(false), []);

  const updateUserLocalState = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return newUser;
    });
  };

  const handleLogin = async (url: string, email: string, password: string) => {
>>>>>>> Stashed changes
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await response.json(); // read JSON once

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed.');
    }

    const { access_token, user: userData } = data;
    if (!access_token || !userData) throw new Error('Invalid login response');

    setAuthToken(access_token);
    localStorage.setItem(TOKEN_KEY, access_token);

    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

<<<<<<< Updated upstream
=======
  const login = (email: string, password: string, userType: 'consumer') => {
    if (userType !== 'consumer') throw new Error('Invalid user type for consumer login.');
    return handleLogin(`${API_BASE_URL}/consumer/login`, email, password);
  };

  const businessLogin = (email: string, password: string, userType: 'business') => {
    if (userType !== 'business') throw new Error('Invalid user type for business login.');
    return handleLogin(`${API_BASE_URL}/business/login`, email, password);
  };

>>>>>>> Stashed changes
  const signup = async (email: string, password: string, name: string, user_type: 'consumer' | 'business') => {
    setLoading(true);
    try {
      if (user_type === 'business') {
        const mockUser: User = {
          id: `${user_type}_${Date.now()}`,
          email,
          username: email.split('@')[0],
          user_type,
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      } else {
        const response = await fetch(`${API_BASE_URL}/consumer/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: name, email, password, user_type })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const forgotPassword = async (email: string) => {
    try {
      await fetch(`${API_BASE_URL}/consumer/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      throw new Error('Failed to connect to reset service.');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/consumer/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Password reset failed.');
    }
  };

  const updateProfile = async (data: FormData) => {
    if (!authToken) throw new Error('Authentication token is missing. Please log in.');

<<<<<<< Updated upstream
  const updateProfile = async (data: FormData): Promise<void> => {
    // Check for token existence
    if (!authToken) {
      throw new Error('Authentication token is missing. Please log in.');
    }

    // Use the secured, JWT-protected endpoint
    const url = `${API_BASE_URL}/consumer/update-profile`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          // JWT INTEGRATION
          'Authorization': `Bearer ${authToken}`,
          // NOTE: Do NOT set 'Content-Type' for FormData, let browser handle it
        },
        body: data, // Pass the FormData object directly
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to update profile. Please try again.';

        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation error list
            errorMessage = errorData.detail.map((err: { loc: string | any[]; msg: any; }) =>
              `${err.loc[err.loc.length - 1]}: ${err.msg}`
            ).join('; ');
          } else {
            // General error detail string
            errorMessage = errorData.detail;
          }
        }

        // The console will now show the actual Pydantic error (e.g., 'profile_pic: field required')
        throw new Error(errorMessage);
      }

      // Process the response and update the user state
      const responseData = await response.json();

      // Expected response format: { message: "...", user: updated_user_data }
      const updatedUser = responseData.user as User;

      // Update state and local storage with the new user data
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      // OPTIONAL: Return a success message if needed by the component
      // return responseData.message; 

    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
=======
    const isPasswordUpdate = data.get('password') && (data.get('password') as string).length > 0;

    const response = await fetch(`${API_BASE_URL}/consumer/update-profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: data
    });

    if (response.status === 401) {
      logout();
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
>>>>>>> Stashed changes
    }

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = 'Failed to update profile.';
      if (errorData.detail) errorMessage = Array.isArray(errorData.detail)
        ? errorData.detail.map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join('; ')
        : errorData.detail;
      throw new Error(errorMessage);
    }

    if (isPasswordUpdate) {
      alert('Password updated. Please log in again.');
      logout();
      window.location.href = '/login';
      return;
    }

    const responseData = await response.json();
    const updatedUser = responseData.user as User;
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return (
<<<<<<< Updated upstream
    <AuthContext.Provider value={{ user, authToken, loading, login, businessLogin, signup, logout, forgotPassword, resetPassword, updateProfile }}>
=======
    <AuthContext.Provider value={{
      user, authToken, loading, login, businessLogin, signup, logout,
      forgotPassword, resetPassword, updateProfile, updateUserLocalState
    }}>
>>>>>>> Stashed changes
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
