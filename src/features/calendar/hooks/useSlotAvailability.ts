import { useState, useEffect } from 'react';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: number;
  total: number;
}

export interface UseSlotAvailabilityProps {
  productTypeId: string | null;
  selectedDate: Date;
  allowUnavailable: boolean;
  onError?: (message: string) => void;
}

export interface UseSlotAvailabilityResult {
  slots: TimeSlot[];
  loading: boolean;
  minNoticeSlots: number;
}

/**
 * Hook to fetch and manage slot availability for a given product type and date
 */
export function useSlotAvailability({
  productTypeId,
  selectedDate,
  allowUnavailable,
  onError
}: UseSlotAvailabilityProps): UseSlotAvailabilityResult {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [minNoticeSlots, setMinNoticeSlots] = useState(0);

  useEffect(() => {
    if (!productTypeId) {
      setSlots([]);
      setLoading(false);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoading(true);
        
        // This is a mock implementation for testing
        // In real implementation, this would fetch from Supabase
        const mockSlots: TimeSlot[] = [
          { startTime: '09:00', endTime: '10:00', available: 2, total: 5 },
          { startTime: '10:00', endTime: '11:00', available: 0, total: 5 },
          { startTime: '11:00', endTime: '12:00', available: 3, total: 5 },
        ];

        // Filter out unavailable slots if not allowed
        const filteredSlots = allowUnavailable 
          ? mockSlots 
          : mockSlots.filter(slot => slot.available > 0);

        // Apply minimum notice period filtering
        const now = new Date();
        const minNoticeDate = new Date(now.setDate(now.getDate() + 2));
        
        const validSlots = filteredSlots.filter(slot => {
          const slotDate = new Date(selectedDate);
          slotDate.setHours(parseInt(slot.startTime.split(':')[0]));
          return slotDate >= minNoticeDate;
        });

        setSlots(validSlots);
        setMinNoticeSlots(2);
      } catch (error) {
        console.error('Error fetching slots:', error);
        onError?.('Failed to load availability');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [productTypeId, selectedDate, allowUnavailable, onError]);

  return {
    slots,
    loading,
    minNoticeSlots
  };
}