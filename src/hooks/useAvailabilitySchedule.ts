-import { supabase } from '../lib/supabase';
 import { useStore } from '../store';
 import { generateBitmap } from '../utils/time';
 import { dayToNumber } from '../constants';
@@ .. @@
   const fetchSchedule = async () => {
    try {
      // Create a fresh schedule with empty ranges
      const defaultSchedule: WeekSchedule = {
        monday: { enabled: true, ranges: [] },
        tuesday: { enabled: true, ranges: [] },
        wednesday: { enabled: true, ranges: [] },
        thursday: { enabled: true, ranges: [] },
        friday: { enabled: true, ranges: [] },
        saturday: { enabled: true, ranges: [] },
        sunday: { enabled: true, ranges: [] }
      };

      // Get schedule from store
      const slots = store.standardSlots;
      slots.forEach(slot => {
        const day = Object.entries(dayToNumber)
          .find(([_, num]) => num === slot.dayOfWeek)?.[0] as keyof WeekSchedule;
        
        if (day) {
          defaultSchedule[day].ranges.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity: slot.totalSlots,
            teamId: slot.teamId,
            id: slot.id
          });
        }
      });

      setSchedule(defaultSchedule);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };
@@ .. @@
  const saveSchedule = async () => {
    try {
      setError(null);
      
      // Convert schedule to standard slots format
      const slots = Object.entries(schedule).flatMap(([day, daySchedule]) =>
        daySchedule.ranges.map(range => ({
          id: range.id || generateId(),
          day_of_week: dayToNumber[day as keyof WeekSchedule],
          startTime: range.startTime,
          endTime: range.endTime,
          totalSlots: range.capacity,
          teamId: range.teamId,
          slotsBitmap: generateBitmap(range.startTime, range.endTime)
        }))
      );

      // Update store
      store.setStandardSlots(slots);

      setHasUnsavedChanges(false);
      setSuccess('Schedule saved successfully');
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Failed to save schedule');
    }
  };