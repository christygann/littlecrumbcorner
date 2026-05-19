import { useState } from 'react'
import { db } from '../lib/supabase.js'

const fieldCls = 'w-full px-3 py-2.5 bg-white/60 border border-cocoa/[0.18] rounded-lg text-[14px] text-cocoa outline-none'
const labelCls = 'block mb-1.5 text-[11px] tracking-[0.22em] uppercase font-medium text-cocoa/65'

export default function LoginView({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!db) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
      const { data, error: err } = await db.auth.signInWithPassword({
        email:    e.target.email.value,
        password: e.target.password.value,
      })
      if (err) throw err
      onSuccess(data.session)
    } catch (err) {
      setError(err.message || 'Sign in failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="w-full max-w-[380px] bg-white rounded-[0.9rem] px-10 py-11 shadow-[0_4px_32px_rgba(107,76,59,0.08)]">
        <h1 className="font-display font-light text-[30px] text-espresso mb-1.5">sign in</h1>
        <p className="text-[13px] text-cocoa/60 mb-8">Admin access only</p>

        {error && (
          <div className="text-[13px] text-deep-rose px-3 py-2 bg-deep-rose/8 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
          <div>
            <label className={labelCls}>email</label>
            <input name="email" className={fieldCls} type="email" required
              autoComplete="email" placeholder="you@email.com" />
          </div>
          <div>
            <label className={labelCls}>password</label>
            <input name="password" className={fieldCls} type="password" required
              autoComplete="current-password" placeholder="••••••••" />
          </div>
          <button
            type="submit" disabled={loading}
            className={`mt-2 py-[9px] px-5 rounded-full bg-cocoa text-cream border-none w-full text-[11px] tracking-[0.25em] uppercase font-medium transition-opacity ${
              loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-85'
            }`}
          >
            {loading ? 'signing in …' : 'sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
