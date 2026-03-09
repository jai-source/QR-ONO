import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { getUserScore } from '../utils/scoreUtils'
import ConfessionsFeed from '../components/ConfessionsFeed'

export default function HomePage() {
  const [user, setUser] = useState(undefined)
  const [score, setScore] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) getUserScore(session.user.id).then(s => setScore(s ?? 0))
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) getUserScore(session.user.id).then(s => setScore(s ?? 0))
      else setScore(0)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-0 rounded-full border-t border-white/80 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 md:px-24 overflow-x-hidden pt-32 pb-24">

      {/* Top Left Small Header */}
      <div className="absolute top-24 left-8 md:left-24 text-[9px] tracking-[0.4em] text-white/40 uppercase font-orbitron flex items-center gap-2">
        <span>ORIGINS' MMXXIV</span>
      </div>

      {/* Main Content Area - Centered */}
      <div className="relative z-10 w-full max-w-sm mx-auto text-center flex flex-col items-center animate-fade-in-slow mb-32">
        <h1 className="font-orbitron text-5xl md:text-6xl tracking-tight mb-2 font-black italic uppercase leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          ONERIOS
        </h1>
        <p className="font-orbitron text-[10px] tracking-[0.5em] text-white/40 uppercase mb-12 ml-2">
          VOID PROTOCOL ACTIVE
        </p>

        {user ? (
          /* LOGGED IN VIEW */
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Score badge */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-[2rem] w-full relative group">
              <div className="absolute inset-0 border border-cyan-neon/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="font-manrope font-bold text-[10px] tracking-[0.3em] text-white/30 uppercase mb-1">Magnitude</p>
              <p className="font-orbitron font-black italic text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {score} <span className="text-sm italic text-white/20">PTS</span>
              </p>
            </div>

            <Link to="/scan" className="w-full">
              <button className="btn-neon-cyan w-full py-5 text-xs tracking-[0.3em]">
                OPEN SCANNER
              </button>
            </Link>

            <Link to="/leaderboard" className="w-full">
              <button className="w-full font-manrope font-bold text-[0.65rem] text-white/30 hover:text-white transition-all uppercase tracking-[0.4em] py-4">
                Global Rankings
              </button>
            </Link>
          </div>
        ) : (
          /* LOGGED OUT VIEW */
          <div className="flex flex-col gap-4 w-full">
            <Link to="/register" className="w-full">
              <button className="btn-neon-cyan w-full py-5 text-xs tracking-[0.3em]">
                INITIALIZE ACCESS
              </button>
            </Link>

            <Link to="/login" className="w-full">
              <button className="w-full font-manrope font-bold text-[0.65rem] text-white/30 hover:text-white transition-all uppercase tracking-[0.4em] py-4">
                EXISTING ENTITY LOGIN
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Home Feed Section */}
      <div className="w-full max-w-4xl mx-auto mt-16 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-neon to-transparent mb-6 opacity-30" />
          <h2 className="font-orbitron font-black text-[0.7rem] text-white tracking-[0.6em] uppercase text-center mb-2">
            Void Origins Transmissions
          </h2>
          <p className="font-manrope font-bold text-[0.55rem] text-white/20 uppercase tracking-[0.4em]">Live Anonymous Feed</p>
        </div>

        <div className="bg-black/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <ConfessionsFeed limit={5} showHeader={false} />

          <div className="p-8 border-t border-white/5 text-center">
            <Link to="/confessions">
              <button className="font-orbitron font-black text-[0.65rem] text-cyan-neon/40 hover:text-cyan-neon transition-all tracking-[0.4em] uppercase">
                ENTER THE TEA SPACE →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section - Reduced visibility on Home for focus */}
      <div className="w-full max-w-4xl mx-auto mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700 pb-20">
        {[
          { label: 'Entities', value: user ? score : '14K+', sub: 'Tracked' },
          { label: 'Pulses', value: '890', sub: 'Detected' },
          { label: 'Nodes', value: '15', sub: 'Synced' },
          { label: 'Status', value: '24h', sub: 'Optimal' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-1 border-l border-white/10 pl-6 py-2">
            <span className="font-orbitron font-black text-2xl text-white tracking-tighter italic">{stat.value}</span>
            <span className="font-manrope font-bold text-[0.55rem] tracking-[0.3em] uppercase text-white/30">{stat.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
