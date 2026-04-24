import { supabase } from './supabase'

// Create a check-in.
// Database unique index should enforce one active check-in per user.
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

// Get active check-in for one user
export const getActiveCheckIn = async (userId) => {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  return { data, error }
}

// Get all active check-ins and attach hunter profile info
export const getActiveCheckIns = async () => {
  const { data: checkins, error: checkinsError } = await supabase
    .from('checkins')
    .select('*')
    .eq('is_active', true)

  if (checkinsError) {
    return { data: null, error: checkinsError }
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name')

  if (profilesError) {
    return { data: null, error: profilesError }
  }

  const merged = (checkins || []).map((checkin) => {
    const profile = (profiles || []).find(
      (profile) => profile.user_id === checkin.user_id
    )

    return {
      ...checkin,
      profiles: profile
        ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
          }
        : null,
    }
  })

  return { data: merged, error: null }
}

// Check out
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
