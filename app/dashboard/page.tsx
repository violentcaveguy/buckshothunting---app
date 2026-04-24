'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { createCheckIn, getActiveCheckIn, checkOut } from '../../lib/checkins'

type Area = {
  id: number
  area_number: number
  area_name: string | null
  is_active: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      const { data: activeData } = await getActiveCheckIn(user.id)
      setActiveCheckIn(activeData || null)

      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('is_active', true)
        .order('area_number', { ascending: true })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setAreas(data || [])
      setLoading(false)
    }

    loadDashboard()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleCheckIn = async (areaId: number) => {
    if (!user) return

    const { error } = await createCheckIn(user.id, areaId)

    if (error) {
      alert(error.message)
      return
    }

    const { data: activeData } = await getActiveCheckIn(user.id)
    setActiveCheckIn(activeData || null)

    alert('Checked in successfully')
  }

  const handleCheckOut = async () => {
    if (!activeCheckIn) return

    const { error } = await checkOut(activeCheckIn.id)

    if (error) {
      alert(error.message)
      return
    }

    setActiveCheckIn(null)
    alert('Checked out successfully')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    )
  }

  const positions: Record<number, string> = {
    1: 'top-[57%] left-[70%]',
    2: 'top-[50%] left-[60%]',
    3: 'top-[39%] left-[52%]',
    4: 'top-[36%] left-[64%]',
    5: 'top-[31%] left-[46%]',
    6: 'top-[28%] left-[61%]',
    7: 'top-[22%] left-[39%]',
    8: 'top-[20%] left-[55%]',
    9: 'top-[12%] left-[39%]',
    10: 'top-[12%] left-[55%]',
    11: 'top-[16%] left-[26%]',
    12: 'top-[24%] left-[26%]',
    13: 'top-[33%] left-[26%]',
    14: 'top-[40%] left-[26%]',
    15: 'top-[49%] left-[20%]',
    16: 'top-[47%] left-[35%]',
    17: 'top-[58%] left-[19%]',
    18: 'top-[55%] left-[31%]',
    19: 'top-[55%] left-[47%]',
    20: 'top-[65%] left-[31%]',
    21: 'top-[65%] left-[45%]',
    22: 'top-[65%] left-[60%]',
    23: 'top-[75%] left-[63%]',
    24: 'top-[72%] left-[13%]',
    25: 'top-[75%] left-[24%]',
    26: 'top-[78%] left-[38%]',
    27: 'top-[83%] left-[54%]',
    28: 'top-[88%] left-[67%]',
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h1 className="text-3xl font-bold">BuckShot Hunting Camp</h1>
          <p className="mt-2 text-stone-400">Dashboard</p>
          <p className="mt-4 text-sm text-stone-300">
            Signed in as: {user?.email}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Active Check-In</h2>

          {activeCheckIn ? (
            <div className="mt-4">
              <p className="text-sm text-stone-400">Currently checked into area ID</p>
              <p className="text-2xl font-bold">{activeCheckIn.area_id}</p>

              <p className="mt-2 text-sm text-stone-400">
                Checked in at: {new Date(activeCheckIn.check_in_time).toLocaleString()}
              </p>

              <button
                onClick={handleCheckOut}
                className="mt-4 rounded-lg bg-amber-700 px-4 py-2 font-medium hover:bg-amber-600"
              >
                Check Out
              </button>
            </div>
          ) : (
            <p className="mt-4 text-stone-400">No active check-in.</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <h2 className="text-xl font-semibold">Check In</h2>
            <p className="mt-2 text-sm text-stone-400">
              Click a numbered area on the map below to check in.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <h2 className="text-xl font-semibold">Stands</h2>
            <p className="mt-2 text-sm text-stone-400">
              Stand pin placement and stand list will go here.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
            <h2 className="text-xl font-semibold">Harvest Log</h2>
            <p className="mt-2 text-sm text-stone-400">
              Harvest logging tied to active area check-in will go here.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Camp Map</h2>
          <p className="mt-2 text-sm text-stone-400">
            Click a numbered area on the map to check in.
          </p>

          <div className="mt-4 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-stone-700">
            <img
              src="/camp-map.jpg"
              alt="BuckShot Hunting Camp Map"
              className="w-full h-auto block"
            />

            {areas.map((area) => (
              <button
                key={area.id}
                onClick={() => !activeCheckIn && handleCheckIn(area.id)}
                disabled={!!activeCheckIn}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm font-bold shadow-lg ${
                  activeCheckIn?.area_id === area.id
                    ? 'bg-green-700 text-white'
                    : activeCheckIn
                    ? 'bg-stone-700 text-stone-300 cursor-not-allowed'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                } ${positions[area.area_number] || 'top-[50%] left-[50%]'}`}
              >
                {area.area_number}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={signOut}
          className="mt-6 rounded-lg bg-red-700 px-4 py-2 font-medium hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}
