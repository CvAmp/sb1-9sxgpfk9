import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, Calendar, Ban, X } from 'lucide-react';
import TimeOptions from '../../components/TimeSelectorOptions';
import { supabase } from '../../lib/supabase';

interface TimeRangeState {
  startTime: string;
  endTime: string;
  capacity: number;
  showAllTimes: boolean;
}

interface TimeRange {
  startTime: string;
  endTime: string;
  capacity: number;
}

interface DaySchedule {
  enabled: boolean;
  ranges: TimeRange[];
}

interface BlockedDate {
  date: string;
  reason: string;
}

type WeekSchedule = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DaySchedule;
};

const AdminCapacityManager: React.FC = () => {
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { enabled: true, ranges: [] },
    tuesday: { enabled: true, ranges: [] },
    wednesday: { enabled: true, ranges: [] },
    thursday: { enabled: true, ranges: [] },
    friday: { enabled: true, ranges: [] },
    saturday: { enabled: true, ranges: [] },
    sunday: { enabled: true, ranges: [] }
  });

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState<BlockedDate>({
    date: new Date().toLocaleDateString('en-CA'),
    reason: ''
  });
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(true);
  const [savingBlockedDate, setSavingBlockedDate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newTimeRange, setNewTimeRange] = useState<TimeRangeState>({
    startTime: '08:00',
    endTime: '17:00',
    capacity: 1,
    showAllTimes: false
  });

  const [selectedDays, setSelectedDays] = useState<Set<keyof WeekSchedule>>(new Set(['monday']));
  const [dateOverrides, setDateOverrides] = useState<Array<{
    date: string;
    ranges: TimeRange[];
  }>>([]);
  const [editingRange, setEditingRange] = useState<{
    day: keyof WeekSchedule;
    index: number;
    range: TimeRange;
  } | null>(null);

  // Fetch blocked dates on component mount
  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      setLoadingBlockedDates(true);
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date');

      if (error) throw error;

      setBlockedDates(data.map(d => ({
        date: d.date,
        reason: d.reason || ''
      })));
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
      setError('Failed to load blocked dates');
    } finally {
      setLoadingBlockedDates(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate.date) return;

    try {
      setSavingBlockedDate(true);
      setError(null);

      // Check if date is already blocked
      const existingDate = blockedDates.find(d => d.date === newBlockedDate.date);
      if (existingDate) {
        setError('This date is already blocked');
        return;
      }

      const { error: insertError } = await supabase
        .from('blocked_dates')
        .insert([{
          date: newBlockedDate.date,
          reason: newBlockedDate.reason.trim() || null
        }]);

      if (insertError) throw insertError;

      setSuccess('Date blocked successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Refresh blocked dates
      await fetchBlockedDates();

      // Reset form
      setNewBlockedDate({
        date: new Date().toLocaleDateString('en-CA'),
        reason: ''
      });
    } catch (err) {
      console.error('Error blocking date:', err);
      setError('Failed to block date');
    } finally {
      setSavingBlockedDate(false);
    }
  };

  const handleRemoveBlockedDate = async (date: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('date', date);

      if (deleteError) throw deleteError;

      setSuccess('Blocked date removed successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Refresh blocked dates
      await fetchBlockedDates();
    } catch (err) {
      console.error('Error removing blocked date:', err);
      setError('Failed to remove blocked date');
    }
  };

  const calculateEffectiveCapacity = (ranges: TimeRange[], time: string) => {
    return ranges
      .filter(range => {
        // Handle ranges that cross midnight
        if (range.startTime > range.endTime) {
          // Range crosses midnight (e.g., 23:30-00:30)
          return time >= range.startTime || time < range.endTime;
        }
        // Normal range within same day
        return range.startTime <= time && range.endTime > time;
      })
      .reduce((total, range) => total + range.capacity, 0);
  };

  const getTimelinePoints = (ranges: TimeRange[]) => {
    const points = new Set<string>();
    ranges.forEach(range => {
      // For ranges crossing midnight, add intermediate points
      if (range.startTime > range.endTime) {
        points.add('23:59');
        points.add('00:00');
      }
      points.add(range.startTime);
      points.add(range.endTime);
    });
    return Array.from(points).sort();
  };

  const isValidTimeRange = (startTime: string, endTime: string): boolean => {
    // Allow ranges that cross midnight
    if (startTime > endTime) {
      return startTime >= '23:00' && endTime <= '00:30';
    }
    return startTime < endTime;
  };

  const getCapacitySegments = (ranges: TimeRange[]) => {
    const timeline = getTimelinePoints(ranges);
    const segments: { startTime: string; endTime: string; capacity: number }[] = [];

    for (let i = 0; i < timeline.length - 1; i++) {
      const startTime = timeline[i];
      const endTime = timeline[i + 1];
      const capacity = calculateEffectiveCapacity(ranges, startTime);
      
      if (capacity > 0) {
        segments.push({ startTime, endTime, capacity });
      }
    }

    return segments;
  };

  const days: Array<{ key: keyof WeekSchedule; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleAddTimeRange = (day: keyof WeekSchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: [...prev[day].ranges, { ...newTimeRange }]
      }
    }));
  };

  const handleRemoveTimeRange = (day: keyof WeekSchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.filter((_, i) => i !== index)
      }
    }));
  };

  const handleDayToggle = (day: keyof WeekSchedule) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleCapacityChange = (day: keyof WeekSchedule, index: number, change: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.map((range, i) => 
          i === index 
            ? { ...range, capacity: Math.max(0, range.capacity + change) }
            : range
        )
      }
    }));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const period = Number(hours) >= 12 ? 'PM' : 'AM';
    const hour12 = Number(hours) % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const handleAddTimeRangeToSelectedDays = () => {
    if (selectedDays.size === 0) return;
    
    // Validate time range
    if (!isValidTimeRange(newTimeRange.startTime, newTimeRange.endTime)) {
      alert('Invalid time range. For ranges crossing midnight, start time must be 23:00 or later and end time must be 00:30 or earlier.');
      return;
    }

    setSchedule(prev => {
      const next = { ...prev };
      selectedDays.forEach(day => {
        next[day] = {
          ...next[day],
          ranges: [...next[day].ranges, { ...newTimeRange }]
        };
      });
      return next;
    });
  };

  const handleEditTimeRange = (day: keyof WeekSchedule, index: number, range: TimeRange) => {
    setEditingRange({ day, index, range });
    setNewTimeRange({ ...range });
    setSelectedDays(new Set([day]));
  };

  const handleUpdateTimeRange = () => {
    if (!editingRange) return;

    // Validate time range
    if (!isValidTimeRange(newTimeRange.startTime, newTimeRange.endTime)) {
      alert('Invalid time range. For ranges crossing midnight, start time must be 23:00 or later and end time must be 00:30 or earlier.');
      return;
    }

    setSchedule(prev => ({
      ...prev,
      [editingRange.day]: {
        ...prev[editingRange.day],
        ranges: prev[editingRange.day].ranges.map((range, i) =>
          i === editingRange.index ? newTimeRange : range
        )
      }
    }));

    handleClearForm();
  };

  const handleClearForm = () => {
    setNewTimeRange({
      startTime: '08:00',
      endTime: '17:00',
      capacity: 1,
      showAllTimes: false
    });
    setSelectedDays(new Set());
    setEditingRange(null);
  };

  const handleAddOverride = () => {
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (!dateInput?.value) return;

    setDateOverrides(prev => {
      // Check if we already have an override for this date
      const existingIndex = prev.findIndex(o => o.date === dateInput.value);
      
      if (existingIndex >= 0) {
        // Update existing override
        const updated = [...prev];
        updated[existingIndex].ranges.push({ ...newTimeRange });
        return updated;
      } else {
        // Add new override
        return [...prev, {
          date: dateInput.value,
          ranges: [{ ...newTimeRange }]
        }];
      }
    });

    // Reset form
    setNewTimeRange({
      startTime: '08:00',
      endTime: '17:00',
      capacity: 1
    });
  };

  return (
    <div className="max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
            <div className="grid grid-cols-7 gap-2">
              {days.map(({ key, label }, index) => (
                <button
                  key={key}
                  onClick={() => handleDayToggle(key)}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    selectedDays.has(key)
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs font-medium">{label[0]}</div>
                  <div className="text-xs mt-1">
                    {schedule[key].ranges.length || '-'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Time Range Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Add Time Range</h3>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-amber-600">Times are saved as Local Time of the Submitting User</p>
                <button 
                  onClick={handleClearForm}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TimeOptions
                value={newTimeRange.startTime}
                showAllTimes={newTimeRange.showAllTimes}
                onToggleAllTimes={(show) => setNewTimeRange(prev => ({
                  ...prev,
                  showAllTimes: show
                }))}
                label="Start Time"
                onChange={(time) => {
                  const currentEndTime = newTimeRange.endTime;
                  setNewTimeRange({
                    ...newTimeRange,
                    startTime: time,
                    endTime: currentEndTime <= time ? time : currentEndTime
                  });
                }}
              />
              <TimeOptions
                value={newTimeRange.endTime}
                showAllTimes={newTimeRange.showAllTimes}
                hideToggle
                label="End Time"
                onChange={(time) => setNewTimeRange({ ...newTimeRange, endTime: time })}
                minTime={newTimeRange.startTime}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNewTimeRange(prev => ({ ...prev, capacity: Math.max(0, prev.capacity - 1) }))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{newTimeRange.capacity}</span>
                <button
                  onClick={() => setNewTimeRange(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={editingRange ? handleUpdateTimeRange : handleAddTimeRangeToSelectedDays}
              disabled={selectedDays.size === 0}
              className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors ${
                selectedDays.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {editingRange ? 'Update Time Range' : `Add to Selected Days (${selectedDays.size})`}
            </button>
            {editingRange && (
              <button
                onClick={handleClearForm}
                className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          {/* Time Ranges List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Base Time Ranges Column */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 h-5">Base Schedule</h3>
                  <div className="space-y-3">
                    {days.map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-medium text-gray-700 h-4">{label}</div>
                        <div className="space-y-1">
                          {schedule[key].ranges.map((range, index) => (
                            <div 
                              key={index} 
                              className={`flex items-center justify-between p-1.5 rounded-lg border-l-4 transition-colors cursor-pointer ${
                                editingRange?.day === key && editingRange?.index === index
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-gray-50 border-blue-200 hover:bg-blue-50'
                              }`}
                              onClick={() => handleEditTimeRange(key, index, range)}
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs">
                                  {formatTime(range.startTime)} - {formatTime(range.endTime)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({range.capacity})
                                </span>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTimeRange(key, index);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cumulative Capacity Column */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 h-5">Total Capacity</h3>
                  <div className="space-y-3">
                    {days.map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-medium text-gray-700 h-4">{label}</div>
                        <div className="space-y-1">
                          {getCapacitySegments(schedule[key].ranges).map((segment, index) => (
                            <div key={`segment-${index}`} className="flex items-center justify-between bg-green-50 p-1.5 rounded-lg border-l-4 border-green-200">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-green-600" />
                                <span className="text-xs">
                                  {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                {segment.capacity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Override Section */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-sm font-semibold mb-2">Capacity Overrides</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <TimeOptions 
                label="Start Time" 
                value={newTimeRange.startTime}
                showAllTimes={newTimeRange.showAllTimes}
                onToggleAllTimes={(show) => setNewTimeRange(prev => ({
                  ...prev,
                  showAllTimes: show
                }))}
                className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(time) => {
                  const currentEndTime = newTimeRange.endTime;
                  setNewTimeRange({
                    ...newTimeRange,
                    startTime: time,
                    endTime: currentEndTime <= time ? time : currentEndTime
                  });
                }}
                className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <TimeOptions
                label="End Time"
                value={newTimeRange.endTime}
                showAllTimes={newTimeRange.showAllTimes}
                hideToggle
                className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(time) => setNewTimeRange({ ...newTimeRange, endTime: time })}
                minTime={newTimeRange.startTime}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={newTimeRange.capacity}
                  onChange={(e) => setNewTimeRange({ ...newTimeRange, capacity: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={handleAddOverride}
                className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Capacity Override
              </button>
              
              {/* List of Date Overrides */}
              {dateOverrides.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Overrides</h3>
                  {dateOverrides.map((override, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {new Date(override.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <button
                          onClick={() => setDateOverrides(prev => prev.filter((_, i) => i !== index))}
                          className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {override.ranges.map((range, rangeIndex) => (
                          <div key={rangeIndex} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>{formatTime(range.startTime)} - {formatTime(range.endTime)}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                              {range.capacity} slots
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Blocked Dates Section */}
          <div className="bg-red-50 rounded-lg shadow-lg p-6">
            <h2 className="text-sm font-semibold mb-2">Blocked Dates</h2>
            {error && (
              <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 p-2 bg-green-100 border border-green-200 rounded text-sm text-green-700">
                {success}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date to Block</label>
                <input
                  type="date"
                  value={newBlockedDate.date}
                  onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <textarea
                  value={newBlockedDate.reason}
                  onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                  placeholder="e.g., Holiday, Maintenance"
                  className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                  rows={2}
                />
              </div>
              <button
                onClick={handleAddBlockedDate}
                disabled={!newBlockedDate.date}
                className="w-full flex items-center justify-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Ban className="w-4 h-4 mr-2" />
                {savingBlockedDate ? 'Blocking...' : 'Block Date'}
              </button>
            </div>

            {/* List of Blocked Dates */}
            {loadingBlockedDates ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              </div>
            ) : blockedDates.length === 0 ? (
              <p className="text-gray-500 text-center mt-4">No dates are currently blocked</p>
            ) : (
              <div className="mt-3 space-y-2">
              {blockedDates.map((blocked, index) => (
                <div
                  key={blocked.date}
                  className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 text-red-600 mr-2" />
                      <span className="text-xs font-medium">
                        {new Date(blocked.date + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {blocked.reason && <p className="text-xs text-gray-600 mt-0.5">{blocked.reason}</p>}
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(blocked.date)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCapacityManager;