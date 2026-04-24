'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    window.location.href = '/dashboard'
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setMessage('Signed out')
    setEmail('')
    setPassword('')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
        <p>Loading...</p>
      </main>
    )
  }

  if (user) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">BuckShot Hunting Camp</h1>
          <p className="text-stone-400 mb-6">You are signed in.</p>

          <div className="mb-6 rounded-lg border border-stone-700 bg-stone-950 p-4">
            <p className="text-sm text-stone-400">Logged in as</p>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>

          <button
            onClick={signOut}
            className="w-full rounded-lg bg-red-700 py-2 font-medium hover:bg-red-600"
          >
            Sign Out
          </button>

          {message && (
            <p className="mt-4 text-sm text-amber-300">{message}</p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">BuckShot Hunting Camp</h1>
        <p className="text-stone-400 mb-6">Member login</p>

        <form onSubmit={signIn} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-700 py-2 font-medium hover:bg-emerald-600"
          >
            Sign In
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-amber-300">{message}</p>
        )}
      </div>
    </main>
  )
}
