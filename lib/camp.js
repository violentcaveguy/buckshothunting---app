import { supabase } from './supabase'

// Get current user's camp status
export const getMyCampStatus = async (userId) => {
  const { data, error } = await supabase
    .from('camp_presence')
    .select('*')
    .eq('user_id', userId)
    .eq('is_at_camp', true)
    .maybeSingle()

  return { data, error }
}

// Get all users at camp
export const getCampMembers = async () => {
  const { data: presence, error: presenceError } = await supabase
    .from('camp_presence')
    .select('*')
    .eq('is_at_camp', true)

  if (presenceError) return { data: null, error: presenceError }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name')

  if (profileError) return { data: null, error: profileError }

  const merged = presence.map((p) => {
    const profile = profiles.find((pr) => pr.user_id === p.user_id)

    return {
      ...p,
      profile,
    }
  })

  return { data: merged, error: null }
}

// Mark user at camp
export const arriveAtCamp = async (userId) => {
  const { data, error } = await supabase
    .from('camp_presence')
    .insert([{ user_id: userId }])

  return { data, error }
}

// Leave camp
export const leaveCamp = async (id) => {
  const { data, error } = await supabase
    .from('camp_presence')
    .update({
      is_at_camp: false,
      left_at: new Date(),
    })
    .eq('id', id)

  return { data, error }
}

// Admin remove
export const adminRemoveFromCamp = async (id, adminId) => {
  const { data, error } = await supabase
    .from('camp_presence')
    .update({
      is_at_camp: false,
      left_at: new Date(),
      removed_by: adminId,
    })
    .eq('id', id)

  return { data, error }
}
