import { supabase } from './supabase'

// Create a check-in (database will block duplicates)
export const createCheckIn = async (userId, areaId) => {
  const { data, error } = await supabase
    .from('checkins')
    .insert([
      {
        user_id: userId,
        area_id: areaId,
      },
    ])

  if (error) {
    // Friendly message for unique active check-in violation
    if (
      error.message?.toLowerCase().includes('duplicate key') ||
      error.message?.toLowerCase().includes('one_active_checkin_per_user')
    ) {
      return {
        data: null,
        error: { message: 'You are already checked into an area' },
      }
    }

    return { data: null, error }
  }

  return { data, error: null }
}

export const getActiveCheckIn = async (userId) => {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  return { data, error }
}

export const checkOut = async (checkInId) => {
  const { data, error } = await supabase
    .from('checkins')
    .update({
      is_active: false,
      check_out_time: new Date(),
    })
    .eq('id', checkInId)

  return { data, error }
}
