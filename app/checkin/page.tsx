'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { createCheckIn, getActiveCheckIn, getActiveCheckIns, checkOut } from '../../lib/checkins'

type Area = {
  id: number
  area_number: number
  area_name: string | null
  is_active: boolean
}

type ActiveHunter = {
  id: number
  user_id: string
  area_id: number
  check_in_time: string
  profiles: {
    first_name: string
    last_name: string
  } | null
}

export default function CheckInPage() {
  const [user, setUser] = useState<any>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [activeHunters, setActiveHunters] = useState<ActiveHunter[]>([])
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const positions: Record<number, string> = {
    1: 'top-[57%] left-[70%]',
    2: 'top-[50%] left-[60%]',
    3: 'top-[39%] left-[52%]',
    4: 'top-[36%] left-[64%]',
    5: 'top-[31%] left-[46%]',
    6: 'top-[28%] left-[61%]',
    7: 'top-[22%] left-[39%]',
    8: 'top-[20%] left-[59%]',
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

  const loadData = async (userId: string) => {
    const { data: activeData } = await getActiveCheckIn(userId)
    setActiveCheckIn(activeData || null)

    const { data: hunterData, error: hunterError } = await getActiveCheckIns()

    if (hunterError) {
      setErrorMessage(hunterError.message)
    } else {
      setActiveHunters(hunterData || [])
    }
  }

  useEffect(() => {
    const loadPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      const { data: areaData, error: areaError } = await supabase
        .from('areas')
        .select('*')
        .eq('is_active', true)
        .order('area_number', { ascending: true })

      if (areaError) {
        setErrorMessage(areaError.message)
        setLoading(false)
        return
      }

      setAreas(areaData || [])
      await loadData(user.id)

      setLoading(false)
    }

    loadPage()
  }, [])

  const huntersByArea = useMemo(() => {
    const grouped: Record<number, ActiveHunter[]> = {}

    activeHunters.forEach((hunter) => {
      if (!grouped[hunter.area_id]) {
        grouped[hunter.area_id] = []
      }

      grouped[hunter.area_id].push(hunter)
    })

    return grouped
  }, [activeHunters])

  const handleCheckIn = async (areaId: number) => {
    if (!user) return

    const { error } = await createCheckIn(user.id, areaId)

    if (error) {
      alert(error.message)
      return
    }

    await loadData(user.id)
    alert('Checked in successfully')
  }

  const handleCheckOut = async () => {
    if (!activeCheckIn || !user) return

    const { error } = await checkOut(activeCheckIn.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadData(user.id)
    alert('Checked out successfully')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p>Loading check-in map...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="mb-4 rounded-lg bg-stone-700 px-4 py-2 font-medium hover:bg-stone-600"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold">Area Check-In</h1>
          <p className="mt-2 text-stone-400">
            Click a numbered area to check in. Hover over an occupied area to see who is checked in.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Current Status</h2>

          {activeCheckIn ? (
            <div className="mt-4">
              <p className="text-sm text-stone-400">Currently checked into area ID</p>
              <p className="text-2xl font-bold">{activeCheckIn.area_id}</p>

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

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Camp Map</h2>

          <div className="mt-4 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-stone-700">
            <img
              src="/camp-map.jpg"
              alt="BuckShot Hunting Camp Map"
              className="w-full h-auto block"
            />

            {areas.map((area) => {
              const areaHunters = huntersByArea[area.id] || []
              const hunterCount = areaHunters.length
              const isMyActiveArea = activeCheckIn?.area_id === area.id
              const isOccupied = hunterCount > 0

              return (
                <div
                  key={area.id}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 ${positions[area.area_number] || 'top-[50%] left-[50%]'}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!activeCheckIn) handleCheckIn(area.id)
                    }}
                    disabled={!!activeCheckIn}
                    className={`relative rounded-full px-3 py-1 text-sm font-bold shadow-lg ${
                      isMyActiveArea
                        ? 'bg-green-700 text-white ring-2 ring-green-300'
                        : activeCheckIn
                        ? 'bg-stone-700 text-stone-300 cursor-not-allowed'
                        : isOccupied
                        ? 'bg-red-700 text-white hover:bg-red-600'
                        : 'bg-amber-500 text-black hover:bg-amber-400'
                    }`}
                  >
                    {area.area_number}

                    {hunterCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white ring-1 ring-white">
                        {hunterCount}
                      </span>
                    )}
                  </button>

                  {hunterCount > 0 && (
                    <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
                      <p className="mb-1 text-stone-300">Checked in:</p>
                      {areaHunters.map((hunter) => (
                        <p key={hunter.id}>
                          {hunter.profiles
                            ? `${hunter.profiles.first_name} ${hunter.profiles.last_name}`
                            : 'Unknown Hunter'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
