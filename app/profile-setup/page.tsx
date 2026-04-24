'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { createProfile, getProfile } from '../../lib/profiles'

export default function ProfileSetupPage() {
  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: existingProfile } = await getProfile(user.id)

      if (existingProfile) {
        window.location.href = '/dashboard'
        return
      }

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!user) return

    const { error } = await createProfile({
      userId: user.id,
      firstName,
      lastName,
      phoneNumber,
      emergencyContact,
      emergencyContactPhone,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p>Loading profile setup...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-stone-400 mb-6">
          This information is used for camp check-ins and emergency contact records.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm mb-2">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Phone Number</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Emergency Contact</label>
            <input
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Emergency Contact Phone</label>
            <input
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-700 py-2 font-medium hover:bg-emerald-600"
          >
            Save Profile
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-amber-300">{message}</p>
        )}
      </div>
    </main>
  )
}
