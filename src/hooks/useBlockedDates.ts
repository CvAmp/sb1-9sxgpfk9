-import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import type { BlockedDate } from '../types';

const fetchBlockedDates = async () => {
    try {
      setLoading(true);
      setBlockedDates(store.blockedDates);
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
      setError('Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
}

const addBlockedDate = async (date: BlockedDate) => {
    try {
      setSaving(true);
      setError(null);
      
      store.addBlockedDate(date);

      setSuccess('Date blocked successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding blocked date:', err);
      setError('Failed to block date');
    } finally {
      setSaving(false);
    }
}

const removeBlockedDate = async (date: string) => {
    try {
      store.removeBlockedDate(date);

      setSuccess('Blocked date removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing blocked date:', err);
      setError('Failed to remove blocked date');
    }
}