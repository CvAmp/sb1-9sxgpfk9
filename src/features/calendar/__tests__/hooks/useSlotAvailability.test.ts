import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlotAvailability } from '../../hooks/useSlotAvailability';
import { supabase } from '../../../../lib/supabase';

// Mock Supabase client
vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { minimum_days_notice: 2, days_to_display: 10 },
            error: null
          }))
        }))
      })),
      in: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    }))
  }
}));

describe('useSlotAvailability', () => {
  const defaultProps = {
    productTypeId: 'test-id',
    selectedDate: new Date('2025-01-01'),
    allowUnavailable: false
  };

  it('initializes with empty slots', () => {
    const { result } = renderHook(() => useSlotAvailability(defaultProps));
    
    expect(result.current.slots).toHaveLength(0);
    expect(result.current.loading).toBe(true);
    expect(result.current.minNoticeSlots).toBe(0);
  });

  it('fetches slots when product type is provided', async () => {
    const { result } = renderHook(() => useSlotAvailability(defaultProps));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('scheduling_thresholds');
  });

  it('handles missing product type', () => {
    const { result } = renderHook(() => 
      useSlotAvailability({ ...defaultProps, productTypeId: null })
    );

    expect(result.current.slots).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });

  it('handles fetch errors', async () => {
    // Mock error response
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: null,
            error: new Error('Fetch error')
          }))
        }))
      }))
    }));

    const onError = vi.fn();
    const { result } = renderHook(() => 
      useSlotAvailability({ ...defaultProps, onError })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onError).toHaveBeenCalledWith('Failed to load availability');
    expect(result.current.loading).toBe(false);
  });

  it('respects minimum notice period', async () => {
    const { result } = renderHook(() => useSlotAvailability(defaultProps));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that slots before minimum notice period are not included
    const now = new Date();
    const minNoticeDate = new Date(now.setDate(now.getDate() + 2));
    
    result.current.slots.forEach(slot => {
      expect(new Date(slot.startTime)).toBeGreaterThanOrEqual(minNoticeDate);
    });
  });

  it('includes unavailable slots when allowed', async () => {
    const { result } = renderHook(() => 
      useSlotAvailability({ ...defaultProps, allowUnavailable: true })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check that fully booked slots are included
    const hasUnavailableSlots = result.current.slots.some(slot => slot.available === 0);
    expect(hasUnavailableSlots).toBe(true);
  });
});