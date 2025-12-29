// ============================================
// FILE: src/lib/auth.js
// Authentication Utilities with Enhanced Security
// ============================================
import Cookies from 'js-cookie';

const USER_KEY = 'zappy_user';
const TOKEN_KEY = 'zappy_token';

export const auth = {
  // Store user session
  login: (user, token) => {
    const options = { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' 
    };
    Cookies.set(TOKEN_KEY, token, options);
    Cookies.set(USER_KEY, JSON.stringify(user), options);
  },

  // Clear session and redirect
  logout: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Get current user
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = Cookies.get(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get auth token
  getToken: () => Cookies.get(TOKEN_KEY),

  // Check authentication status
  isAuthenticated: () => !!Cookies.get(TOKEN_KEY),

  // Role checking with safety fallbacks
  hasRole: (role) => {
    const user = auth.getUser();
    return user?.role === role;
  },
  
  isVendor: () => auth.hasRole('vendor'),
  
  isCustomer: () => auth.hasRole('customer'),

  isAdmin: () => auth.hasRole('admin'),

  // Get user name for display
  getUserName: () => {
    const user = auth.getUser();
    return user?.profile?.name || user?.email || 'Operator';
  },
};