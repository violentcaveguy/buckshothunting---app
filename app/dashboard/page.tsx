'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getActiveCheckIn, checkOut } from '../../lib/checkins'
import { getIsAdmin } from '../../lib/stands'
import {
  getMyCampStatus,
  getCampMembers,
  arriveAtCamp,
  leaveCamp,
  adminRemoveFromCamp,
} from '../../lib/camp'
import { getGibsonWeather } from '../../lib/weather'

type CampMember = {
  id: number
  user_id: string
  arrived_at: string
  profile?: {
    first_name: string
    last_name: string
  } | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [campStatus, setCampStatus] = useState<any>(null)
  const [campMembers, setCampMembers] = useState<CampMember[]>([])
  const [weather, setWeather] = useState<any>(null)

  const loadDashboardData = async (userId: string) => {
    const { data: activeData } = await getActiveCheckIn(userId)
    setActiveCheckIn(activeData || null)

    const { data: campData } = await getMyCampStatus(userId)
    setCampStatus(campData || null)

    const { data: membersData, error: membersError } = await getCampMembers()

    if (membersError) {
      setErrorMessage(membersError.message)
    } else {
      setCampMembers(membersData || [])
    }
  }

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

      const { data: adminData } = await getIsAdmin(user.id)
      setIsAdmin(!!adminData)

      await loadDashboardData(user.id)

      try {
        const weatherData = await getGibsonWeather()
        setWeather(weatherData)
      } catch (error: any) {
        setErrorMessage(error.message || 'Unable to load weather')
      }

      setLoading(false)
    }

    loadDashboard()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleArriveAtCamp = async () => {
    if (!user) return

    const { error } = await arriveAtCamp(user.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadDashboardData(user.id)
  }

  const handleLeaveCamp = async () => {
    if (!campStatus || !user) return

    const { error } = await leaveCamp(campStatus.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadDashboardData(user.id)
  }

  const handleAdminRemove = async (presenceId: number) => {
    if (!user) return

    const confirmed = confirm('Remove this member from camp?')

    if (!confirmed) return

    const { error } = await adminRemoveFromCamp(presenceId, user.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadDashboardData(user.id)
  }

  const handleCheckOut = async () => {
    if (!activeCheckIn || !user) return

    const { error } = await checkOut(activeCheckIn.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadDashboardData(user.id)
    alert('Checked out successfully')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const today = weather?.daily?.time?.[0]
  const sunrise = weather?.daily?.sunrise?.[0]
  const sunset = weather?.daily?.sunset?.[0]
  const currentTemp = weather?.current?.temperature_2m
  const humidity = weather?.current?.relative_humidity_2m
  const wind = weather?.current?.wind_speed_10m
  const precip = weather?.current?.precipitation
  const high = weather?.daily?.temperature_2m_max?.[0]
  const low = weather?.daily?.temperature_2m_min?.[0]
  const rainChance = weather?.daily?.precipitation_probability_max?.[0]

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h1 className="text-3xl font-bold">BuckShot Hunting Camp</h1>
          <p className="mt-2 text-stone-400">Home Dashboard</p>
          <p className="mt-4 text-sm text-stone-300">
            Signed in as: {user?.email}
          </p>

          {isAdmin && (
            <p className="mt-2 text-sm font-semibold text-emerald-400">
              Admin access enabled
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Gibson, GA Weather</h2>

          {weather ? (
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-stone-700 bg-stone-950 p-4">
                <p className="text-sm text-stone-400">Date</p>
                <p className="mt-1 text-lg font-bold">
                  {today ? new Date(today).toLocaleDateString() : 'Today'}
                </p>
              </div>

              <div className="rounded-xl border border-stone-700 bg-stone-950 p-4">
                <p className="text-sm text-stone-400">Current</p>
                <p className="mt-1 text-lg font-bold">{Math.round(currentTemp)}°F</p>
                <p className="text-sm text-stone-400">
                  H {Math.round(high)}° / L {Math.round(low)}°
                </p>
              </div>

              <div className="rounded-xl border border-stone-700 bg-stone-950 p-4">
                <p className="text-sm text-stone-400">Sun</p>
                <p className="mt-1 text-sm">Sunrise: {formatTime(sunrise)}</p>
                <p className="text-sm">Sunset: {formatTime(sunset)}</p>
              </div>

              <div className="rounded-xl border border-stone-700 bg-stone-950 p-4">
                <p className="text-sm text-stone-400">Conditions</p>
                <p className="mt-1 text-sm">Humidity: {humidity}%</p>
                <p className="text-sm">Wind: {Math.round(wind)} mph</p>
                <p className="text-sm">Rain: {rainChance ?? 0}%</p>
                <p className="text-sm">Precip: {precip ?? 0} in</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-stone-400">Weather unavailable.</p>
          )}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="text-2xl font-semibold">Camp Presence</h2>

            {campStatus ? (
              <div className="mt-4">
                <p className="text-sm text-stone-400">
                  You arrived at {formatTime(campStatus.arrived_at)}
                </p>

                <button
                  onClick={handleLeaveCamp}
                  className="mt-4 rounded-lg bg-amber-700 px-4 py-2 font-medium hover:bg-amber-600"
                >
                  Leave Camp
                </button>
              </div>
            ) : (
              <button
                onClick={handleArriveAtCamp}
                className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 font-medium hover:bg-emerald-600"
              >
                I&apos;m at Camp
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="text-2xl font-semibold">Members at Camp</h2>

            {campMembers.length > 0 ? (
              <div className="mt-4 space-y-3">
                {campMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-stone-700 bg-stone-950 p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {member.profile
                          ? `${member.profile.first_name} ${member.profile.last_name}`
                          : 'Unknown Member'}
                      </p>
                      <p className="text-sm text-stone-400">
                        Arrived at {formatTime(member.arrived_at)}
                      </p>
                    </div>

                    {isAdmin && member.user_id !== user?.id && (
                      <button
                        onClick={() => handleAdminRemove(member.id)}
                        className="rounded-lg bg-red-700 px-3 py-1 text-sm font-medium hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-stone-400">No members currently marked at camp.</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="text-2xl font-semibold">Area Check-In</h2>

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
              <button
                onClick={() => (window.location.href = '/checkin')}
                className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 font-medium hover:bg-emerald-600"
              >
                Check In
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="text-2xl font-semibold">Stand Pins</h2>
            <p className="mt-2 text-sm text-stone-400">
              Open a clean map to drop or manage stand pins.
            </p>

            <button
              onClick={() => (window.location.href = '/stand')}
              className="mt-4 rounded-lg bg-blue-700 px-4 py-2 font-medium hover:bg-blue-600"
            >
              Drop Stand Pin
            </button>
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
