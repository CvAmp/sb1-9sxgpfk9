import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Database helper functions with type safety
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, teams(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      user_id,
      role,
      users (
        email,
        role
      )
    `)
    .eq('team_id', teamId);

  if (error) throw error;
  return data;
}

// Realtime subscription helpers
export function subscribeToTeamEvents(teamId: string, callback: (payload: any) => void) {
  return supabase
    .channel('team_events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `team_id=eq.${teamId}`
      },
      callback
    )
    .subscribe();
}