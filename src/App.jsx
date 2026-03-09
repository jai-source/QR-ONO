import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from './supabase/supabaseClient'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PlayPage from './pages/PlayPage'
import Leaderboard from './pages/Leaderboard'
import ConfessionsPage from './pages/ConfessionsPage'
import ConfessionsToast from './components/ConfessionsToast'

// Lazy-load ScanPage so html5-qrcode is only downloaded when the user goes to /scan
const ScanPage = lazy(() => import('./pages/ScanPage'))

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-neon/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-neon animate-spin" />
        </div>
      </div>
    )
  }

  return authed ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [newConfession, setNewConfession] = useState(null)

  useEffect(() => {
    // Listen for global confessions to show real-time toast
    const channel = supabase
      .channel('global:confessions_toast')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'confessions' }, payload => {
        // Only show toast if window is active to avoid spamming background users
        if (document.visibilityState === 'visible') {
          setNewConfession(payload.new)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <BrowserRouter>
      {newConfession && (
        <ConfessionsToast
          confession={newConfession}
          onClose={() => setNewConfession(null)}
        />
      )}
      <Navbar />
      <main className="pt-14">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-neon/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-neon animate-spin" />
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/confessions" element={<ConfessionsPage />} />
            {/* /play is accessible without auth — PlayPage handles auth redirect internally */}
            <Route path="/play" element={<PlayPage />} />
            <Route path="/scan" element={<ScanPage />} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}
