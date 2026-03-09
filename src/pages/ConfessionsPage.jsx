import { useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useNavigate } from 'react-router-dom'
import ConfessionsFeed from '../components/ConfessionsFeed'

export default function ConfessionsPage() {
  const navigate = useNavigate()

  // State management
  const [pageLoading, setPageLoading] = useState(true)
  const [user, setUser] = useState(null)

  // User availability state
  const [availableConfessions, setAvailableConfessions] = useState(0)

  // Form state
  const [newConfession, setNewConfession] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function initPage() {
      setPageLoading(true)

      // 1. Fetch Session
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      // 2. Fetch Unlocks
      if (currentUser) {
        await checkUserUnlocks(currentUser.id)
      }

      setPageLoading(false)
    }

    initPage()
  }, [])

  async function checkUserUnlocks(userId) {
    const { count: correctCount, error: countError } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_correct', true)

    if (countError) {
      console.error('Error fetching scan count:', countError)
      return
    }

    const { count: confessionCount, error: confError } = await supabase
      .from('confessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (confError) {
      console.error('Error fetching confession count:', confError)
      return
    }

    const available = Math.max(0, (correctCount || 0) - (confessionCount || 0))
    setAvailableConfessions(available)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (availableConfessions <= 0) {
      setErrorMsg("You need to answer more QR Quests correctly to unlock a confession.")
      return
    }
    if (!newConfession.trim()) {
      setErrorMsg("Confession cannot be empty.")
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    const { error } = await supabase.from('confessions').insert({
      user_id: user.id,
      content: newConfession.trim()
    })

    if (error) {
      setErrorMsg("Failed to post confession: " + error.message)
    } else {
      setSuccessMsg("Confession released into the void.")
      setNewConfession('')
      setAvailableConfessions(prev => prev - 1)
    }
    setSubmitting(false)

    if (!error) {
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-cyan-neon/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-pink-neon/10 rounded-full blur-[150px] animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-8 animate-fade-in-slow">
          {/* Onerios Loader Ring */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
            <div className="absolute inset-0 rounded-full border-t-[3px] border-cyan-neon animate-spin shadow-[0_0_15px_rgba(77,216,230,0.5)]" />
            <div className="absolute inset-4 rounded-full border-[1px] border-pink-neon/20 animate-pulse" />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="font-orbitron font-black text-xl text-white tracking-[0.5em] uppercase mb-2">ONERIOS</h2>
            <p className="font-manrope font-bold text-[0.6rem] text-white/30 tracking-[0.8em] uppercase animate-pulse">Scanning Void Session</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12 pt-28 pb-24 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-cyan-neon/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-pink-neon/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 w-full animate-fade-in">

        {/* Header Section - Modern Fest Style */}
        <div className="mb-16 text-center">
          <div className="inline-block relative">
            <h1 className="font-orbitron font-black text-4xl md:text-7xl text-white mb-2 tracking-tighter uppercase italic leading-none">
              SPILL <span className="text-cyan-neon">THE</span> TEA
            </h1>
            <div className="h-2 bg-gradient-to-r from-transparent via-pink-neon to-transparent opacity-50 blur-sm mt-[-8px] mb-4" />
          </div>
          <p className="font-manrope font-medium tracking-[0.4em] text-white/40 text-xs md:text-sm uppercase mt-4">
            Anonymous • No Filter • Real Spill
          </p>
        </div>

        {/* Submit Confession Form - Pro Glass Design */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 mb-20 shadow-2xl relative group overflow-hidden">
          {/* Subtle animated border glow */}
          <div className="absolute inset-0 border-[2px] border-cyan-neon/0 group-hover:border-cyan-neon/20 transition-all duration-700 rounded-[2.5rem] pointer-events-none" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <h2 className="font-orbitron font-bold tracking-[0.2em] uppercase text-white/90 text-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-neon shadow-[0_0_8px_#4dd8e6]" />
              New Entry
            </h2>

            {user && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-sm">
                <span className="font-manrope font-semibold text-[0.6rem] text-white/40 uppercase tracking-[0.2em]">Unlock Count</span>
                <span className={`font-orbitron font-black text-lg ${availableConfessions > 0 ? 'text-cyan-neon drop-shadow-[0_0_8px_rgba(77,216,230,0.8)]' : 'text-white/20'}`}>
                  {availableConfessions}
                </span>
              </div>
            )}
          </div>

          {!user ? (
            <div className="text-center py-16 px-6 bg-black/20 rounded-[2rem] border border-white/5">
              <p className="font-manrope text-2xl text-white/60 mb-10 font-light">Login to start spilling.</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-black font-orbitron font-bold text-xs tracking-[0.2em] px-12 py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                JOIN THE FEST
              </button>
            </div>
          ) : availableConfessions <= 0 ? (
            <div className="text-center py-16 px-6 bg-black/20 rounded-[2rem] border border-white/5">
              <p className="font-manrope text-2xl text-white/60 mb-6 font-light">Out of tea passes? 🤐</p>
              <p className="font-manrope text-sm text-white/30 tracking-wide max-w-xs mx-auto">Nail a QR Quest to earn your next drop.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="relative group/input">
                <textarea
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xl md:text-2xl font-orbitron font-medium tracking-wider text-white placeholder-white/5 resize-none min-h-[160px] leading-relaxed transition-all duration-500"
                  placeholder="Any tea you wanna spill? Drop it here..."
                  value={newConfession}
                  onChange={e => setNewConfession(e.target.value)}
                  maxLength={500}
                  required
                />
                {/* Dynamic animated underline */}
                <div className="relative h-[1px] w-full bg-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-neon to-transparent translate-x-[-100%] group-focus-within/input:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="font-manrope font-medium tracking-[0.2em] text-[0.65rem] text-white/30 uppercase">
                    {newConfession.length} / 500
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !newConfession.trim()}
                  className="group relative inline-flex items-center gap-4 bg-cyan-neon text-black font-orbitron font-black text-xs tracking-[0.2em] px-14 py-5 rounded-full hover:shadow-[0_0_30px_rgba(77,216,230,0.4)] transition-all disabled:opacity-30 disabled:hover:shadow-none"
                >
                  <span>{submitting ? 'SENDING...' : 'RELEASE IT'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* Performance/Status Messages */}
              {(errorMsg || successMsg) && (
                <div className="mt-4 text-center animate-fade-in">
                  {errorMsg && <p className="text-pink-neon font-manrope font-bold text-sm uppercase tracking-widest">{errorMsg}</p>}
                  {successMsg && <p className="text-cyan-neon font-manrope font-bold text-sm uppercase tracking-widest animate-pulse">{successMsg}</p>}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Confessions Feed - Minimalist Pro List */}
        <ConfessionsFeed />
      </div>
    </div>
  )
}
