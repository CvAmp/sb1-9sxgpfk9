import { useState, useEffect } from 'react';
import { addDays, startOfDay, endOfDay, format, eachHourOfInterval } from 'date-fns';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import type { TimeSlot } from '../types';

interface UseSlotAvailabilityProps {
  productTypeId: string | null;
  selectedDate: Date;
  allowUnavailable?: boolean;
  onError?: (error: string) => void;
}

export function useSlotAvailability({
  productTypeId,
  selectedDate,
  allowUnavailable = false,
  onError
}: UseSlotAvailabilityProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [minNoticeSlots, setMinNoticeSlots] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productTypeId) {
      setSlots([]);
      setLoading(false);
      return;
    }

    async function fetchAvailability() {
      setLoading(true);
      try {
        // Get scheduling threshold
        const { data: threshold, error: thresholdError } = await supabase
          .from('scheduling_thresholds')
          .select('minimum_days_notice')
          .eq('product_type_id', productTypeId)
          .single();

        if (thresholdError) throw thresholdError;

        const minDays = threshold?.minimum_days_notice || 2;
        const minNoticeDate = addDays(new Date(), minDays);
        
        // Get standard slots
        const { data: standardSlots, error: slotsError } = await supabase
          .from('standard_slots')
          .select('*')
          .eq('day_of_week', selectedDate.getDay());

        if (slotsError) throw slotsError;

        // Generate all possible time slots for the day
        const allTimeSlots: TimeSlot[] = [];
        
        // Always generate 5 days of slots
        const startDate = selectedDate;
        const endDate = addDays(startDate, 4); // 5 days total
        
        for (let currentDate = startDate; currentDate <= endDate; currentDate = addDays(currentDate, 1)) {
          // Generate slots for each day (8 AM to 5 PM)
          for (let hour = 8; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
              const slotDate = new Date(currentDate);
              slotDate.setHours(hour, minute, 0, 0);
              
              const endTime = new Date(slotDate);
              endTime.setMinutes(endTime.getMinutes() + 30);

              // Find matching standard slot
              const standardSlot = standardSlots?.find(slot => {
                const slotStart = slot.startTime;
                return slotStart === format(slotDate, 'HH:mm:ss');
              });

              // Add slot with appropriate capacity
              const capacity = standardSlot?.totalSlots || 0;
              const available = Math.max(0, capacity - Math.floor(Math.random() * 3)); // Simulate some bookings

              // Always add the slot, regardless of capacity or availability
              allTimeSlots.push({
                startTime: slotDate.toISOString(),
                endTime: endTime.toISOString(),
                capacity,
                available: allowUnavailable ? 0 : available,
                key: `${slotDate.toISOString()}-${capacity}-${available}`
              });
            }
          }
        }

        // Calculate minimum notice slots
        const noticeSlots = allTimeSlots.filter(slot => 
          new Date(slot.startTime) < minNoticeDate
        ).length;

        setMinNoticeSlots(noticeSlots);
        setSlots(allTimeSlots);
      } catch (err) {
        console.error('Error fetching availability:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load availability';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [productTypeId, selectedDate, allowUnavailable, onError]);

  return {
    slots,
    loading,
    minNoticeSlots,
    error
  };
}