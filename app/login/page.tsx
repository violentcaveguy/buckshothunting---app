'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getProfile } from '../../lib/profiles'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await getProfile(user.id)

      if (!profile) {
        window.location.href = '/profile-setup'
        return
      }
    }

    window.location.href = '/dashboard'
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setMessage('Signed out')
    setEmail('')
    setPassword('')
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          BuckShot Hunting Camp
        </h1>

        <p className="text-stone-400 mb-6">
          Sign in to access the member dashboard
        </p>

        <form onSubmit={signIn} className="space-y-5">
          <div>
            <label className="block text-sm mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 py-2 font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={signOut}
          className="mt-4 w-full rounded-lg bg-red-700 py-2 font-medium hover:bg-red-600"
        >
          Sign Out
        </button>

        {message && (
          <p className="mt-4 text-sm text-amber-300">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
