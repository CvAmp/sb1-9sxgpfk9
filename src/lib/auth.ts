import { useStore } from '../store';
import type { User } from '../types';

// Local storage key for auth state
const AUTH_KEY = 'calendar-tool-auth';

// Hardcoded credentials for development
const DEV_CREDENTIALS = {
  email: 'jstrunk@eridiangc.com',
  password: '1234'
};

export async function login(email: string, password: string): Promise<User> {
  // In development, check credentials
  if (email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password) {
    const user = {
      id: 'dev-user-id',
      email: DEV_CREDENTIALS.email,
      role: 'ADMIN' as const,
      teamId: null
    };
    
    // Store auth state
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    return user;
  }
  throw new Error('Invalid email or password');
}

export async function logout(): Promise<void> {
  // Clear auth state
  localStorage.removeItem(AUTH_KEY);
  return Promise.resolve();
}

export async function getCurrentUser(): Promise<User | null> {
  // Check local storage for auth state
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as User;
  } catch (err) {
    console.error('Error parsing stored auth:', err);
    return null;
  }
}