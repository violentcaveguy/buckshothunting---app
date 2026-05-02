'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { createStand, getStands, deleteStand, getIsAdmin } from '../../lib/stands'

type Stand = {
  id: number
  user_id: string
  area_id: number
  stand_name: string
  pin_top: number
  pin_left: number
}

export default function StandPage() {
  const [user, setUser] = useState<any>(null)
  const [stands, setStands] = useState<Stand[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadStands = async () => {
    const { data } = await getStands()
    setStands(data || [])
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

      const { data: adminData } = await getIsAdmin(user.id)
      setIsAdmin(!!adminData)

      await loadStands()
      setLoading(false)
    }

    loadPage()
  }, [])

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!user) return

    const standName = prompt('Enter member/stand name:')

    if (!standName || !standName.trim()) return

    const rect = e.currentTarget.getBoundingClientRect()
    const pinLeft = ((e.clientX - rect.left) / rect.width) * 100
    const pinTop = ((e.clientY - rect.top) / rect.height) * 100

    const { error } = await createStand({
      userId: user.id,
      areaId: 0,
      standName: standName.trim(),
      pinTop,
      pinLeft,
    })

    if (error) {
      alert(error.message)
      return
    }

    await loadStands()
    alert('Stand pin saved')
  }

  const handleDeleteStand = async (standId: number) => {
    const confirmed = confirm('Delete this stand pin?')
    if (!confirmed) return

    const { error } = await deleteStand(standId)

    if (error) {
      alert(error.message)
      return
    }

    await loadStands()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p>Loading stand map...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="mb-4 rounded-lg bg-stone-700 px-4 py-2 font-medium hover:bg-stone-600"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h1 className="text-3xl font-bold">Drop Stand Pin</h1>
          <p className="mt-2 text-stone-400">
            Click anywhere on the clean map to drop a stand pin.
          </p>
        </div>

        <div
          onClick={handleMapClick}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-stone-700"
        >
          <img
            src="/camp-map.jpg"
            alt="BuckShot Hunting Camp Map"
            className="w-full h-auto block"
          />

          {stands.map((stand) => {
            const canDelete = isAdmin || stand.user_id === user?.id

            return (
              <div
                key={stand.id}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${stand.pin_top}%`,
                  left: `${stand.pin_left}%`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-full bg-blue-600 px-2 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-white">
                  📍
                </div>

                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
                  {stand.stand_name}
                </div>

                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteStand(stand.id)
                    }}
                    className="absolute -right-3 -top-3 hidden h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white shadow-lg hover:bg-red-600 group-hover:flex"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
