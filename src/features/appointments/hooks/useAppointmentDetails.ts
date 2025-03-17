import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { AppointmentDetails } from '../types';

export function useAppointmentDetails(id: string) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Appointment not found');

      setAppointment(data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  return {
    appointment,
    loading,
    error,
    refresh: fetchAppointment
  };
}