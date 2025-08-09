// Mock Supabase client for testing
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({
          data: { minimum_days_notice: 2, days_to_display: 10 },
          error: null
        })
      }),
      in: () => Promise.resolve({
        data: [],
        error: null
      })
    })
  })
};