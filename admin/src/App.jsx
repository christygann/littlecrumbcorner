import { useState, useEffect } from 'react'
import Topbar from './components/Topbar.jsx'
import LoginView from './components/LoginView.jsx'
import DashboardView from './components/DashboardView.jsx'
import { db } from './lib/supabase.js'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking

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
      {session ? <DashboardView /> : <LoginView onSuccess={setSession} />}
    </div>
  )
}
