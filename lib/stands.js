import { supabase } from './supabase'

export const getStands = async () => {
  const { data, error } = await supabase
    .from('stands')
    .select('*')
    .order('created_at', { ascending: true })

  return { data, error }
}

export const createStand = async ({ userId, areaId, standName, pinTop, pinLeft }) => {
  const { data, error } = await supabase
    .from('stands')
    .insert([
      {
        user_id: userId,
        area_id: areaId,
        stand_name: standName,
        pin_top: pinTop,
        pin_left: pinLeft,
      },
    ])

  return { data, error }
}

export const deleteStand = async (standId) => {
  const { data, error } = await supabase
    .from('stands')
    .delete()
    .eq('id', standId)

  return { data, error }
}

export const getIsAdmin = async (userId) => {
  const { data, error } = await supabase.rpc('is_app_admin', {
    check_user: userId,
  })

  return { data, error }
}
