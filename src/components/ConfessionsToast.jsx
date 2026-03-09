import { useState, useEffect } from 'react'

export default function ConfessionsToast({ confession, onClose }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Small delay to trigger entry animation
        const timer = setTimeout(() => setVisible(true), 10)

        // Auto-close after 6 seconds
        const closeTimer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 500) // Call onClose after exit animation
        }, 6000)

        return () => {
            clearTimeout(timer)
            clearTimeout(closeTimer)
        }
    }, [onClose])

    return (
        <div
            className={`fixed top-20 right-4 sm:right-8 z-[100] transition-all duration-500 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className="bg-black/80 backdrop-blur-2xl border-l-[4px] border-pink-neon rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-[320px] relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-pink-neon/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-pink-neon/20 flex items-center justify-center text-xl flex-shrink-0 animate-bounce">
                        🍵
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-orbitron font-black text-[0.55rem] text-pink-neon tracking-[0.2em] uppercase">
                                New Transmission
                            </span>
                            <button
                                onClick={() => {
                                    setVisible(false)
                                    setTimeout(onClose, 500)
                                }}
                                className="text-white/20 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="font-orbitron text-sm text-white/90 leading-relaxed line-clamp-2 italic">
                            "{confession.content}"
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="font-manrope font-bold text-[0.5rem] text-white/20 uppercase tracking-[0.1em]">
                                Entity_{confession.id.toString().slice(0, 4)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-pink-neon shadow-[0_0_8px_#e84393]" />
                        </div>
                    </div>
                </div>

                {/* Moving progress bar for time left */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-pink-neon/30 w-full">
                    <div className="h-full bg-pink-neon animate-shrink-width" style={{ animationDuration: '6s', transformOrigin: 'left' }} />
                </div>
            </div>
        </div>
    )
}
