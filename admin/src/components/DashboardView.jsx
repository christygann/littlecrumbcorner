import { useState, useEffect } from 'react'
import { db } from '../lib/supabase.js'

function fmtDate(iso) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: true })
  )
}

function exportCSV(signups) {
  const headers = ['Date', 'Name', 'Telegram / Phone', 'Slot', 'Dietary', 'Referral', 'Note']
  const rows = signups.map(s => [
    new Date(s.created_at).toLocaleString('en-SG'),
    s.full_name || '',
    s.telegram_phone || '',
    s.preferred_slot || '',
    s.dietary || '',
    s.referral || '',
    s.note || '',
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `signups-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

const COLS = ['date', 'name', 'telegram / phone', 'slot', 'dietary', 'referral', 'note', '']

const ghostBtn = 'py-[7px] px-4 rounded-full bg-transparent text-cocoa border border-cocoa/25 text-[10px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50'
const darkBtn  = 'py-[7px] px-4 rounded-full bg-cocoa text-cream border-none text-[10px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:opacity-85 transition-opacity'

function EditModal({ signup, onSave, onClose }) {
  const [form, setForm] = useState({
    full_name:      signup.full_name || '',
    telegram_phone: signup.telegram_phone || '',
    preferred_slot: signup.preferred_slot || '',
    dietary:        signup.dietary || '',
    referral:       signup.referral || '',
    note:           signup.note || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    const { error } = await db.from('signups').update(form).eq('id', signup.id)
    if (error) {
      setErr(error.message)
      setSaving(false)
    } else {
      onSave({ ...signup, ...form })
    }
  }

  const fieldCls = 'w-full border border-cocoa/20 rounded-lg px-3 py-2 text-[13px] text-cocoa bg-cream placeholder:text-cocoa/30'
  const labelCls = 'text-[10px] tracking-[0.2em] uppercase text-sage-dark font-medium'

  return (
    <div
      className="fixed inset-0 bg-espresso/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[0.9rem] p-7 w-full max-w-md shadow-[0_8px_40px_rgba(61,43,36,0.15)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display font-light text-[26px] text-espresso mb-1">edit sign-up</h3>
        <p className="text-[12px] text-cocoa/50 mb-6">{signup.full_name}</p>

        {err && (
          <div className="text-[12px] text-deep-rose bg-deep-rose/8 px-3 py-2 rounded-lg mb-4">{err}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>name</label>
            <input className={fieldCls} value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>telegram / phone</label>
            <input className={fieldCls} value={form.telegram_phone} onChange={e => set('telegram_phone', e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>preferred slot</label>
            <input className={fieldCls} placeholder="e.g. 1:00 — 2:00" value={form.preferred_slot} onChange={e => set('preferred_slot', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>dietary</label>
            <input className={fieldCls} placeholder="none" value={form.dietary} onChange={e => set('dietary', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>referral</label>
            <input className={fieldCls} placeholder="e.g. instagram" value={form.referral} onChange={e => set('referral', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>note</label>
            <textarea className={`${fieldCls} resize-none`} rows={3} value={form.note} onChange={e => set('note', e.target.value)} />
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={saving} className={`${darkBtn} flex-1 justify-center`}>
              {saving ? 'saving…' : 'save changes'}
            </button>
            <button type="button" onClick={onClose} className={ghostBtn}>
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardView() {
  const [signups,    setSignups]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [query,      setQuery]      = useState('')
  const [editing,    setEditing]    = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await db
        .from('signups')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setSignups(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = query.trim()
    ? signups.filter(s => s.full_name?.toLowerCase().includes(query.toLowerCase()))
    : signups

  const handleDelete = async (id) => {
    const { error: err } = await db.from('signups').delete().eq('id', id)
    if (err) {
      setError(err.message)
    } else {
      setSignups(s => s.filter(r => r.id !== id))
    }
    setDeletingId(null)
  }

  const handleSave = (updated) => {
    setSignups(s => s.map(r => r.id === updated.id ? updated : r))
    setEditing(null)
  }

  return (
    <div className="flex-1 p-4 sm:p-10 max-w-[1100px] w-full mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-light text-[32px] text-espresso">
            home cafe sign-ups
          </h2>
          <div className="text-[13px] text-cocoa/60 mt-1">
            {signups.length} {signups.length === 1 ? 'person' : 'people'} · 27 May 2026
          </div>
        </div>
        <div className="flex gap-2.5 items-center">
          <button className={ghostBtn} onClick={load} disabled={loading}>
            {loading ? '…' : 'refresh'}
          </button>
          <button className={darkBtn} onClick={() => exportCSV(filtered)}>
            export csv
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full sm:w-72 border border-cocoa/20 rounded-full px-4 py-2 text-[13px] text-cocoa bg-white placeholder:text-cocoa/30 transition"
        />
        {query.trim() && (
          <>
            <span className="text-[12px] text-cocoa/50 whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
            <button
              onClick={() => setQuery('')}
              className="text-[11px] text-cocoa/40 hover:text-cocoa/70 transition-colors cursor-pointer"
            >
              clear
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="text-[13px] text-deep-rose px-3 py-2 bg-deep-rose/8 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[0.9rem] shadow-[0_2px_14px_rgba(107,76,59,0.05)] overflow-hidden">
        <table className="w-full border-collapse text-[13px]">
          <thead className="bg-linen">
            <tr>
              {COLS.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-[10px] tracking-[0.25em] uppercase font-medium text-sage-dark border-b border-cocoa/8 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-16 font-display italic text-[20px] text-cocoa/45">
                  loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 font-display italic text-[20px] text-cocoa/45">
                  {query.trim() ? 'no matches found' : 'no sign-ups yet'}
                </td>
              </tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="hover:bg-cream/60 transition-colors">
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top text-[12px] text-cocoa/55 whitespace-nowrap">
                  {fmtDate(s.created_at)}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top font-normal">
                  {s.full_name || '—'}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top">
                  {s.telegram_phone || '—'}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top">
                  {s.preferred_slot
                    ? <span className="inline-block px-2.5 py-0.5 bg-linen rounded-full text-[11px] whitespace-nowrap">{s.preferred_slot}</span>
                    : '—'}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top hidden sm:table-cell">
                  {s.dietary
                    ? <span className="inline-block px-2.5 py-0.5 bg-sage-light/40 rounded-full text-[11px] text-sage-dark">{s.dietary}</span>
                    : <span className="text-cocoa/45 italic">none</span>}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top hidden sm:table-cell">
                  {s.referral
                    ? <span className="inline-block px-2.5 py-0.5 bg-sage-light/40 rounded-full text-[11px] text-sage-dark">{s.referral}</span>
                    : <span className="text-cocoa/45 italic">—</span>}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top text-[12px] opacity-75 max-w-[220px] hidden sm:table-cell">
                  {s.note || ''}
                </td>
                <td className="px-4 py-3.5 border-b border-cocoa/[0.06] align-top whitespace-nowrap">
                  {deletingId === s.id ? (
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[11px] text-cocoa/60 mr-0.5">sure?</span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full bg-deep-rose text-white cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-cocoa/20 text-cocoa cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        no
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setDeletingId(null); setEditing(s) }}
                        className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-cocoa/20 text-cocoa cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => { setEditing(null); setDeletingId(s.id) }}
                        className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-deep-rose/30 text-deep-rose cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal
          signup={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
