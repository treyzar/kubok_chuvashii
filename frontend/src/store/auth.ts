import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'org' | 'executor';
  status: 'active' | 'blocked';
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  department_id?: number;
}

interface AuthState {
  user: User | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getFullName: () => string;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8888/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userId: null,

      login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Login failed' }));
          throw new Error(error.message || 'Invalid email or password');
        }

        const data = await response.json();
        set({ user: data.user, userId: data.user_id });
      },

      logout: () => {
        set({ user: null, userId: null });
      },

      isAuthenticated: () => {
        return get().user !== null;
      },

      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        
        const parts = [user.last_name, user.first_name, user.middle_name].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : user.email;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
