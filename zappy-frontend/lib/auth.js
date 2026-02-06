// ============================================
// FILE: src/lib/auth.js
// Stable Authentication Utilities (Next.js Safe)
// ============================================
import Cookies from 'js-cookie';

const USER_KEY = 'zappy_user';
const TOKEN_KEY = 'zappy_token';

// 🧠 In-memory cache (prevents race conditions)
let cachedUser = null;
let cachedToken = null;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;

  try {
    cachedToken = Cookies.get(TOKEN_KEY) || null;
    const userStr = Cookies.get(USER_KEY);
    cachedUser = userStr ? JSON.parse(userStr) : null;
  } catch {
    cachedToken = null;
    cachedUser = null;
  }

  hydrated = true;
}

export const auth = {
  // ✅ Login and hydrate cache
  login: (user, token) => {
    const options = {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    Cookies.set(TOKEN_KEY, token, options);
    Cookies.set(USER_KEY, JSON.stringify(user), options);

    cachedToken = token;
    cachedUser = user;
    hydrated = true;
  },

  // ✅ Logout cleanly
  logout: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);

    cachedToken = null;
    cachedUser = null;
    hydrated = false;

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // ✅ Stable auth check
  isAuthenticated: () => {
    hydrate();
    return Boolean(cachedToken);
  },

  // ✅ Stable user getter
  getUser: () => {
    hydrate();
    return cachedUser;
  },

  // ✅ Token getter (used by axios interceptor)
  getToken: () => {
    hydrate();
    return cachedToken;
  },

  // Role helpers
  hasRole: (role) => {
    const user = auth.getUser();
    return user?.role === role;
  },

  isVendor: () => auth.hasRole('vendor'),
  isCustomer: () => auth.hasRole('customer'),
  isAdmin: () => auth.hasRole('admin'),

  getUserName: () => {
    const user = auth.getUser();
    return user?.profile?.name || user?.email || 'Operator';
  },
};
