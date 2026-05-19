import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SLOTS, REFERRAL } from '../data.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const db = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const field = 'w-full px-3 py-2.5 bg-white/60 border border-cocoa/[0.18] rounded-lg text-[14px] text-cocoa leading-[1.4]'
const label = 'block mb-1.5 text-[11px] tracking-[0.22em] uppercase font-medium text-cocoa/65'

export default function SignUpForm() {
  const [slot,      setSlot]      = useState(SLOTS[0])
  const [referral,  setReferral]  = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const nameRef    = useRef(null)
  const teleRef    = useRef(null)
  const dietaryRef = useRef(null)
  const noteRef    = useRef(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!db) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: dbErr } = await db.from('signups').insert({
        full_name:      nameRef.current.value.trim(),
        telegram_phone: teleRef.current.value.trim(),
        preferred_slot: slot,
        dietary:        dietaryRef.current.value.trim() || null,
        referral:       referral || null,
        note:           noteRef.current.value.trim() || null,
      })
      if (dbErr) throw dbErr
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or reach us on Telegram.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="py-7 px-6 text-center text-cocoa">
      <div className="font-display italic font-light text-[28px] mb-1.5">thank you —</div>
      <div className="text-cocoa/65 leading-[1.55]">
        see you at our home cafe<br />
        <span className="inline-block mt-2.5 font-display italic text-[18px] text-cocoa">
          38 Jalan Kechot · 419223
        </span>
      </div>
    </div>
  )

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>full name</label>
          <input ref={nameRef} className={field} type="text" required placeholder="jane lee" />
        </div>
        <div>
          <label className={label}>telegram / phone</label>
          <input ref={teleRef} className={field} type="text" required placeholder="@yourhandle or +65 …" />
        </div>
      </div>

      <div>
        <label className={label}>preferred slot</label>
        <select className={field} value={slot} onChange={e => setSlot(e.target.value)}>
          {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className={label}>dietary / allergies</label>
        <input ref={dietaryRef} className={field} type="text"
          placeholder="nut allergy, gluten-free, none …" />
      </div>

      <div>
        <label className={label}>how did you hear about us</label>
        <div className="flex flex-wrap gap-2">
          {REFERRAL.map(r => (
            <button
              key={r} type="button" onClick={() => setReferral(r)}
              className={`text-[12px] font-normal px-3.5 py-[7px] rounded-full cursor-pointer lowercase transition-all duration-200 ${
                referral === r
                  ? 'bg-cocoa text-cream border border-transparent'
                  : 'bg-transparent text-cocoa border border-cocoa/[0.18]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>a note (optional)</label>
        <textarea
          ref={noteRef}
          className={`${field} resize-y min-h-[70px]`}
          rows={3}
          placeholder="bringing a friend who loves cheesecake …"
        />
      </div>

      {error && (
        <div className="text-[13px] text-deep-rose px-3 py-2 bg-deep-rose/8 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className={`mt-1.5 py-3.5 px-6 rounded-full bg-cocoa text-cream border-none text-[11px] tracking-[0.3em] uppercase font-medium transition-opacity duration-200 ${
          loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {loading ? 'saving …' : 'save my spot'}
      </button>
    </form>
  )
}
