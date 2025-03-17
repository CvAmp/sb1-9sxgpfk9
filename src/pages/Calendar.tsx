import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, parseISO, isSameDay, getDay, eachDayOfInterval, getWeek, endOfWeek, getMonth, getYear, setMonth, setYear, addMonths, subMonths, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, AlertCircle } from 'lucide-react';
import { DayView } from '../components/DayView';
import { EventFilterToggle, EventFilter } from '../components/EventFilterToggle';
import { useStore } from '../store';
import type { CalendarEvent } from '../types';

// Helper function to safely parse ISO date strings
const safeParseISO = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  try {
    return parseISO(dateString);
  } catch (e) {
    console.error('Error parsing date:', e);
    return null;
  }
};

// Helper Components
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
    <p className="text-red-700">{message}</p>
  </div>
);

const NavigationButton = ({ 
  onClick, 
  direction, 
  label 
}: { 
  onClick: () => void; 
  direction: 'left' | 'right'; 
  label: string;
}) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
    aria-label={label}
  >
    {direction === 'left' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
  </button>
);

const EventIndicator = ({ count }: { count: number }) => (
  <div className="flex items-center space-x-1">
    <CalendarIcon className="w-4 h-4 text-blue-600" />
    <span className="text-sm font-medium text-blue-600">
      {count} appointment{count !== 1 ? 's' : ''}
    </span>
  </div>
);

const EventCard = ({ event, onClick }: { event: CalendarEvent; onClick: () => void }) => {
  const startTime = safeParseISO(event.startTime);

  if (!startTime) return null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-sm transition-colors duration-150"
    >
      <div className="space-y-0.5">
        <div className="font-medium">SO-{event.orderId}</div>
        <div className="text-xs flex justify-between">
          <span>{format(startTime, 'HH:mm')}</span>
          <span className="truncate ml-2">{event.customerName}</span>
        </div>
      </div>
    </button>
  );
};

function Calendar() {
  const navigate = useNavigate();
  const store = useStore();
  const { user, impersonatedUser } = store;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<EventFilter>('my-events');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayView, setShowDayView] = useState(false);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const users = store.users;
  const teams = store.teams;

  useEffect(() => {
    if (user) {
      fetchUserTeam();
    }
  }, [user]);

  const fetchUserTeam = async () => {
    const currentUser = users.find(u => u.id === user?.id);
    if (currentUser?.teamId) {
      setUserTeamId(currentUser.teamId);
      setTeamMembers(users
        .filter(u => u.teamId === currentUser.teamId)
        .map(u => u.id)
      );
    }
  };

  const formatAppointmentTime = (date: string) => {
    const parsedDate = safeParseISO(date);
    return parsedDate ? format(parsedDate, 'h:mm a') : '';
  };

  const handleCreateEvent = async (startTime: Date, endTime: Date) => {
    if (!user) {
      setError('You must be logged in to create events');
      return;
    }

    // Navigate to create appointment page with selected date
    navigate('/create-appointment', {
      state: { selectedDate: startTime }
    });
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/appointment/${eventId}`);
  };

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // Filter events based on date range and user selection
      const filteredEvents = store.events.filter(event => {
        const eventDate = safeParseISO(event.startTime);
        if (!eventDate) return false;
        
        const isInRange = eventDate >= monthStart && eventDate <= monthEnd;
        
        if (!isInRange) return false;
        
        switch (eventFilter) {
          case 'my-events':
            return event.createdBy === user.id;
          case 'team-events':
            return teamMembers.includes(event.createdBy);
          default:
            return true;
        }
      });
      
      setEvents(filteredEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, user, eventFilter, teamMembers, store.events]);

  const renderDayAppointments = (dayEvents: CalendarEvent[]) => {
    // Sort events chronologically
    const sortedEvents = [...dayEvents].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Display first 4 events
    const displayedEvents = sortedEvents.slice(0, 4);
    const remainingCount = sortedEvents.length - 4;

    return (
      <div className="space-y-1">
        {displayedEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => handleEventClick(event.id)}
            className="w-full text-left px-2 py-1 rounded text-sm hover:bg-blue-50 transition-colors duration-150"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 whitespace-nowrap">
                {formatAppointmentTime(event.startTime)}
              </span>
              <span className="text-gray-900 truncate">
                {event.title}
              </span>
            </div>
          </button>
        ))}
        {remainingCount > 0 && (
          <div className="px-2 py-1">
            <span className="text-sm font-medium text-blue-600">
              +{remainingCount} more appointment{remainingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary-text border-b-2 border-accent/50 inline-block pb-1 mb-6">Calendar View</h1>

      {error && <ErrorMessage message={error} />}

      {/* Week View */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-text">This Week</h2>
          <div className="flex items-center space-x-4">
            <NavigationButton
              onClick={() => setCurrentDate(prev => addDays(prev, -7))}
              direction="left"
              label="Previous week"
            />
            <div className="text-secondary-text font-medium">
              Wk {getWeek(currentDate)} ({format(startOfWeek(currentDate), 'MMM d')}-{format(endOfWeek(currentDate), 'd')})
            </div>
            <NavigationButton
              onClick={() => setCurrentDate(prev => addDays(prev, 7))}
              direction="right"
              label="Next week"
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-secondary-bg">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate), i)).map((day) => {
            const dayEvents = events.filter(event => {
              const eventDate = safeParseISO(event.startTime);
              return eventDate && isSameDay(eventDate, day);
            });

            return (
              <div key={day.toString()} className="bg-primary-bg p-4 border border-secondary-bg">
                <h2 className="font-medium text-sm text-primary-text">
                  {format(day, 'EEEE')}
                </h2>
                <p className="mt-1 text-2xl text-primary-text">
                  {format(day, 'd')}
                </p>
                {renderDayAppointments(dayEvents)}
              </div>
            );
          })}
        </div>
        <EventFilterToggle value={eventFilter} onChange={setEventFilter} />
      </div>

      {/* Month View */}
      <div className="space-y-4 mt-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-text">Entire Month</h2>
          <div className="flex items-center space-x-4">
            <NavigationButton
              onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
              direction="left"
              label="Previous month"
            />
            <input
              type="month"
              value={`${getYear(currentDate)}-${String(getMonth(currentDate) + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-').map(Number);
                const newDate = setYear(setMonth(currentDate, month - 1), year);
                setCurrentDate(newDate);
              }}
              className="rounded-md border border-secondary-bg shadow-sm px-4 py-2 focus:ring-accent focus:border-accent bg-primary-bg text-primary-text"
            />
            <NavigationButton
              onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
              direction="right"
              label="Next month"
            />
          </div>
        </div>

        <div className="bg-primary-bg rounded-lg shadow border border-secondary-bg">
          <div className="grid grid-cols-7 gap-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-sm font-medium text-secondary-text p-2 bg-secondary-bg">
                {day}
              </div>
            ))}
            {eachDayOfInterval({
              start: startOfMonth(currentDate),
              end: endOfMonth(currentDate)
            }).map((day) => {
              const dayEvents = events.filter(event => {
                const eventDate = safeParseISO(event.startTime);
                return eventDate && isSameDay(eventDate, day);
              });
              
              return (
                <div
                  key={day.toString()}
                  className={`p-2 border border-secondary-bg min-h-[80px] bg-primary-bg hover:bg-accent/5 transition-colors duration-150`}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowDayView(true);
                  }}
                >
                  <div className="text-sm font-medium text-primary-text">
                    {format(day, 'd')}
                  </div>

                  <div className="mt-1">
                    {dayEvents.length > 0 && !loading && (
                      renderDayAppointments(dayEvents)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Day View Modal */}
      {showDayView && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowDayView(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <DayView
                date={selectedDate}
                events={events.filter(event => {
                  const eventDate = safeParseISO(event.startTime);
                  if (!eventDate) return false;
                  return isSameDay(eventDate, selectedDate);
                })}
                onDateChange={(newDate) => setSelectedDate(newDate)}
                onSelectSlot={(start, end) => {
                  navigate('/create-appointment', {
                    state: { selectedDate: start }
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;