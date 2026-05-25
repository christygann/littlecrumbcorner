import { useState, useEffect } from 'react'
import Topbar from './components/Topbar.jsx'
import LoginView from './components/LoginView.jsx'
import DashboardView from './components/DashboardView.jsx'
import OrdersView from './components/OrdersView.jsx'
import { db } from './lib/supabase.js'

const NAV_TABS = [
  { key: 'signups', label: 'Sign-ups' },
  { key: 'orders',  label: 'Orders' },
]

export default function App() {
  const [session, setSession] = useState(undefined)
  const [view, setView] = useState('signups')

  useEffect(() => {
    if (!db) { setSession(null); return }
    db.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = db.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await db?.auth.signOut()
    setSession(null)
  }

  if (session === undefined) return (
    <div className="flex items-center justify-center h-screen font-display text-[22px] text-sage italic">
      loading…
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-cream text-cocoa">
      <Topbar showLogout={!!session} onLogout={signOut} />
      {session && (
        <div className="border-b border-cocoa/[0.08] bg-white/60 backdrop-blur-sm overflow-x-auto">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-10 flex gap-0 min-w-fit">
            {NAV_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setView(t.key)}
                className={`px-5 py-3.5 text-[10px] tracking-[0.25em] uppercase font-medium transition-all cursor-pointer border-b-2 -mb-px ${
                  view === t.key
                    ? 'border-cocoa text-cocoa'
                    : 'border-transparent text-cocoa/45 hover:text-cocoa/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {session
        ? view === 'orders' ? <OrdersView /> : <DashboardView />
        : <LoginView onSuccess={setSession} />
      }
    </div>
  )
}
