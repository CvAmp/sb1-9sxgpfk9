import { supabase } from './supabase';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<User> {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!user) throw new Error('No user returned from auth');

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*, teams(*)')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('User profile not found');

    return {
      id: user.id,
      email: user.email!,
      role: profile.role,
      teamId: profile.team_id
    };
  } catch (err) {
    console.error('Login error:', err);
    throw new Error('Invalid email or password');
  }
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*, teams(*)')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email!,
      role: profile.role,
      teamId: profile.team_id
    };
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
}