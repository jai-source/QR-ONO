/**
 * A single MCQ answer button.
 *
 * Props:
 *   label       - "A" | "B" | "C" | "D"
 *   text        - option text
 *   selected    - bool (this option is currently selected)
 *   result      - null | "correct" | "wrong"  (after submission)
 *   disabled    - bool
 *   onClick     - handler
 */
export default function AnswerButton({ label, text, selected, result, disabled, onClick }) {
  const baseClass =
    'w-full flex items-center gap-4 px-5 py-5 rounded-2xl border text-left font-manrope text-base transition-all duration-300 cursor-pointer shadow-lg'

  let stateClass = ''
  let glowStyle = {}

  if (result === 'correct') {
    stateClass = 'border-green-400/50 bg-green-400/20 text-green-300'
    glowStyle = { boxShadow: '0 0 20px rgba(74,222,128,0.3)' }
  } else if (result === 'wrong') {
    stateClass = 'border-pink-neon/50 bg-pink-neon/20 text-pink-neon'
    glowStyle = { boxShadow: '0 0 20px rgba(232,67,147,0.3)' }
  } else if (selected) {
    stateClass = 'border-cyan-neon bg-cyan-neon/10 text-white'
    glowStyle = { boxShadow: '0 0 20px rgba(77,216,230,0.25)' }
  } else {
    stateClass = 'border-white/5 bg-black/40 text-white/50 hover:border-white/20 hover:bg-white/5 hover:text-white'
  }

  const disabledClass = disabled ? 'pointer-events-none' : ''
  const resultIcon = result === 'correct' ? '✓' : result === 'wrong' ? '✗' : null

  return (
    <button
      className={`${baseClass} ${stateClass} ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        touchAction: 'manipulation',
        minHeight: '64px',
        ...glowStyle
      }}
    >
      {/* Label badge */}
      <span
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-orbitron text-sm font-black border transition-all duration-300"
        style={
          result === 'correct'
            ? { borderColor: 'rgba(74,222,128,0.8)', color: '#4ade80', background: 'rgba(74,222,128,0.1)' }
            : result === 'wrong' && selected
              ? { borderColor: 'rgba(232,67,147,0.8)', color: '#e84393', background: 'rgba(232,67,147,0.1)' }
              : selected
                ? { borderColor: 'rgba(77,216,230,0.8)', color: '#ffffff', background: 'rgba(77,216,230,0.2)', transform: 'scale(1.05)' }
                : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', background: 'transparent' }
        }
      >
        {resultIcon ?? label}
      </span>

      {/* Option text */}
      <span className="flex-1 font-orbitron font-bold text-sm tracking-wide">{text}</span>
    </button>
  )
}
