import { useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'

export default function ConfessionsFeed({ limit = 50, showHeader = true, compact = false }) {
    const [confessions, setConfessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConfessions()

        // Subscribe to new confessions for real-time updates
        const channel = supabase
            .channel('public:confessions_feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'confessions' }, payload => {
                setConfessions(prev => [payload.new, ...prev].slice(0, limit))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [limit])

    async function fetchConfessions() {
        setLoading(true)
        const { data, error } = await supabase
            .from('confessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!error && data) {
            setConfessions(data)
        } else {
            console.error("Error fetching confessions", error)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center py-12 gap-4">
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-cyan-neon to-transparent animate-pulse" />
                <div className="font-orbitron text-[0.55rem] text-white/20 tracking-[0.4em] uppercase animate-pulse">Syncing Void...</div>
            </div>
        )
    }

    if (confessions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="font-manrope text-sm text-white/10 font-light italic">The void is silent. For now.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in w-full">
            {showHeader && (
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                    <h2 className="font-orbitron font-black text-[0.65rem] text-white/30 tracking-[0.5em] uppercase">
                        Captured Frequencies
                    </h2>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-0 divide-y divide-white/5">
                {confessions.map((confession) => (
                    <div
                        key={confession.id}
                        className={`group relative transition-all duration-500 hover:bg-white/[0.02] ${compact ? 'py-6 px-4' : 'py-10 px-6'}`}
                    >
                        <div className={`mx-auto flex flex-col items-center ${compact ? 'max-w-md' : 'max-w-xl'}`}>

                            {/* Anonymous Source Badge */}
                            <div className="flex items-center gap-2 mb-4 opacity-20 group-hover:opacity-60 transition-all duration-500">
                                <div className="w-1 h-1 rounded-full bg-pink-neon" />
                                <span className="font-manrope text-[0.55rem] font-bold text-white uppercase tracking-[0.2em]">
                                    Void_Entity_{confession.id.toString().slice(0, 4)}
                                </span>
                            </div>

                            {/* Confession Body */}
                            <p className={`font-orbitron text-center leading-relaxed text-white/70 group-hover:text-white transition-all duration-500 font-medium tracking-wide ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
                                "{confession.content}"
                            </p>

                            {/* Timestamp */}
                            <div className="mt-6 flex items-center gap-4 opacity-0 group-hover:opacity-10 transition-all duration-500">
                                <div className="h-px w-4 bg-white" />
                                <span className="font-manrope font-bold text-[0.5rem] tracking-widest uppercase">
                                    {new Date(confession.created_at).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric'
                                    })}
                                </span>
                                <div className="h-px w-4 bg-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
