import { supabase } from './supabase'

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

export const createProfile = async ({
  userId,
  firstName,
  lastName,
  phoneNumber,
  emergencyContact,
  emergencyContactPhone,
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        emergency_contact: emergencyContact,
        emergency_contact_phone: emergencyContactPhone,
      },
    ])

  return { data, error }
}
