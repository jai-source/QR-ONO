export default function QuestionCard({ question, children }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 relative p-6 sm:p-10 animate-slide-up rounded-[2rem] shadow-2xl overflow-hidden">
      {/* Decorative inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-neon/5 to-transparent pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-neon/40 to-transparent" />

      {/* Question label */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-pink-neon shadow-[0_0_10px_#e84393]" />
        <span className="font-orbitron font-bold text-[0.65rem] tracking-[0.3em] text-white/40 uppercase">DATA COMMAND</span>
      </div>

      {/* Question text */}
      <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white leading-tight mb-10 tracking-tight">
        {question}
      </h2>

      {/* Answer options slot */}
      <div className="flex flex-col gap-4 relative z-10">
        {children}
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-pink-neon/20 to-transparent" />
    </div>
  )
}
