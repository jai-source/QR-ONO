import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { updateScore } from '../utils/scoreUtils'
import QuestionCard from '../components/QuestionCard'
import AnswerButton from '../components/AnswerButton'
import ConfessionsFeed from '../components/ConfessionsFeed'

const POINTS_CORRECT = 10
const POINTS_WRONG = -5
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ─── Hardcoded question bank ──────────────────────────────────────────────────
// Each question is shown based on a deterministic hash of the QR token,
// so the same token always yields the same question.
const QUESTIONS = [
  { question: "What do most people check immediately after waking up?", options: ["Phone notifications", "Weather", "Homework", "TV"], correct: 0 },
  { question: "What usually drains your phone battery the fastest?", options: ["Instagram/Reels", "Calculator", "Notes app", "Clock"], correct: 0 },
  { question: "What is the most common excuse for being late?", options: ["Traffic", "Overslept", "Phone died", "Forgot"], correct: 1 },
  { question: "What do most people do when WiFi stops working?", options: ["Restart router", "Blame the provider", "Turn WiFi off/on", "All of these"], correct: 3 },
  { question: "What is the most used app by students daily?", options: ["Instagram", "WhatsApp", "YouTube", "All of these"], correct: 3 },
  { question: "What do people usually say when they drop their phone?", options: ["Oh no!", "It's fine", "Please don't break", "All of these"], correct: 3 },
  { question: "What is the hardest thing to wake up for?", options: ["Morning class", "Gym", "Meeting", "Alarm"], correct: 0 },
  { question: "What do people usually do while watching Netflix?", options: ["Scroll phone", "Eat snacks", "Pause a lot", "All of these"], correct: 3 },
  { question: "What do students fear the most?", options: ["Surprise test", "Assignment deadline", "Attendance shortage", "All of these"], correct: 3 },
  { question: "What do people usually forget to bring?", options: ["Phone charger", "Wallet", "Keys", "All of these"], correct: 3 },
  { question: "What do people usually do when bored in class?", options: ["Scroll phone", "Talk to friends", "Zone out", "All of these"], correct: 3 },
  { question: "What do most people do first when they reach home?", options: ["Lie down", "Eat something", "Check phone", "All of these"], correct: 3 },
  { question: "What happens when someone says 'one last episode'?", options: ["Sleep", "Watch 5 more", "Stop immediately", "Turn TV off"], correct: 1 },
  { question: "What do people do when their phone storage is full?", options: ["Delete photos", "Delete apps", "Ignore it", "Complain"], correct: 0 },
  { question: "What is the most common midnight snack?", options: ["Maggi", "Chips", "Cookies", "All of these"], correct: 3 },
  { question: "What do most people do while waiting for food?", options: ["Use phone", "Talk", "Stare at food", "All of these"], correct: 0 },
  { question: "What is the most used feature on a phone?", options: ["Camera", "Internet", "Messages", "Flashlight"], correct: 1 },
  { question: "What happens when someone says 'I'll sleep early today'?", options: ["They sleep early", "They scroll till 3AM", "They study", "They exercise"], correct: 1 },
  { question: "What do most people do when their alarm rings?", options: ["Wake up", "Snooze", "Turn it off", "Throw phone"], correct: 1 },
  { question: "What do people usually do in a long lecture?", options: ["Take notes", "Use phone", "Sleep", "All of these"], correct: 3 },
  { question: "What is the most common group chat name?", options: ["Boys", "Squad", "No one studies", "Random"], correct: 1 },
  { question: "What do people check most on their phone?", options: ["Notifications", "Battery", "Time", "Weather"], correct: 0 },
  { question: "What happens when someone says 'I'll start studying tomorrow'?", options: ["They study", "They delay again", "They sleep", "They give up"], correct: 1 },
  { question: "What is the most common reason for low battery?", options: ["Instagram", "YouTube", "Games", "All of these"], correct: 3 },
  { question: "What do people usually do when food arrives?", options: ["Take photo", "Start eating", "Share", "Check smell"], correct: 0 },
  { question: "What happens when WiFi is slow?", options: ["Frustration", "Refresh page", "Complain", "All of these"], correct: 3 },
  { question: "What is the most common reaction to exam results?", options: ["Check marks", "Check friends' marks", "Panic", "All of these"], correct: 3 },
  { question: "What do most people do during a boring meeting?", options: ["Look busy", "Check phone", "Daydream", "All of these"], correct: 3 },
  { question: "What is the most common laptop problem?", options: ["Low battery", "Slow speed", "Too many tabs", "All of these"], correct: 3 },
  { question: "What happens when someone says 'free food'?", options: ["People appear instantly", "People ignore it", "No one comes", "Food disappears"], correct: 0 },
  { question: "What do people usually do while charging phone?", options: ["Use it", "Leave it", "Forget it", "All of these"], correct: 0 },
  { question: "What is the most common phrase during exams?", options: ["Did you study?", "What's coming?", "I'm dead", "All of these"], correct: 3 },
  { question: "What happens when phone falls on the floor?", options: ["Panic", "Check screen", "Say something loudly", "All of these"], correct: 3 },
  { question: "What do people do when bored online?", options: ["Scroll reels", "Watch YouTube", "Check memes", "All of these"], correct: 3 },
  { question: "What is the most common thing people lose?", options: ["Charger", "Earphones", "Keys", "All of these"], correct: 3 },
  { question: "What happens when someone says 'last game'?", options: ["They stop", "They play 5 more", "They sleep", "They quit"], correct: 1 },
  { question: "What is the most common student diet?", options: ["Maggi", "Pizza", "Chips", "All of these"], correct: 3 },
  { question: "What happens when group project starts?", options: ["One person works", "Everyone works", "No one works", "Confusion"], correct: 0 },
  { question: "What is the most common phrase in coding?", options: ["Why isn't this working?", "It worked yesterday", "Just one bug", "All of these"], correct: 3 },
  { question: "What happens when laptop freezes?", options: ["Panic", "Restart", "Hit keyboard", "All of these"], correct: 3 },
  { question: "What do people usually do before sleeping?", options: ["Scroll phone", "Watch video", "Set alarm", "All of these"], correct: 3 },
  { question: "What is the most common phone notification?", options: ["Instagram", "WhatsApp", "YouTube", "All of these"], correct: 3 },
  { question: "What happens when someone says 'just 5 minutes'?", options: ["5 minutes", "30 minutes", "1 hour", "Never happens"], correct: 1 },
  { question: "What do people do when internet works again?", options: ["Celebrate", "Reload everything", "Download stuff", "All of these"], correct: 3 },
  { question: "What is the most common thing people Google?", options: ["How to fix something", "Movie info", "Random questions", "All of these"], correct: 3 },
  { question: "What happens when someone says 'I'll start gym tomorrow'?", options: ["They go", "They delay", "They forget", "Never happens"], correct: 1 },
  { question: "What is the most common late night activity?", options: ["Watching reels", "Gaming", "Chatting", "All of these"], correct: 3 },
  { question: "What happens when someone sends a meme?", options: ["Ignore", "Laugh", "Send another meme", "All of these"], correct: 3 },
  { question: "What is the most common phrase before exams?", options: ["I'm not ready", "It's easy", "I studied everything", "I'm doomed"], correct: 0 },
  { question: "What happens when food delivery says 'arriving soon'?", options: ["Wait at door", "Track order", "Refresh app", "All of these"], correct: 3 },
]

// Deterministic hash: same token → same question index every time
function tokenToQuestionIndex(token) {
  let hash = 5381
  for (let i = 0; i < token.length; i++) {
    hash = Math.imul(hash, 33) ^ token.charCodeAt(i)
  }
  return Math.abs(hash) % QUESTIONS.length
}

export default function PlayPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [phase, setPhase] = useState('loading') // loading | auth | already-scanned | question | result | error
  const [user, setUser] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)   // 0 | 1 | 2 | 3
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [scoreChange, setScoreChange] = useState(null)
  const [newScore, setNewScore] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing QR token.')
      setPhase('error')
      return
    }
    initPlay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function initPlay() {
    // 1. Check auth
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setPhase('auth')
      return
    }
    const currentUser = session.user
    setUser(currentUser)

    // 2. Check if this token was already scanned by this user
    const { data: existingScan, error: scanCheckError } = await supabase
      .from('scans')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('qr_token', token)
      .maybeSingle()

    if (scanCheckError) {
      setMessage(`Error checking scan history: ${scanCheckError.message} (code: ${scanCheckError.code})`)
      setPhase('error')
      return
    }

    if (existingScan) {
      setPhase('already-scanned')
      return
    }

    // 3. Pick question deterministically from hardcoded bank
    //    Same token always shows the same question — fair across all players
    setQuestion(QUESTIONS[tokenToQuestionIndex(token)])
    setPhase('question')
  }

  async function handleSubmit() {
    if (selected === null || submitted) return
    setSubmitted(true)

    const correct = selected === question.correct
    setIsCorrect(correct)
    const delta = correct ? POINTS_CORRECT : POINTS_WRONG
    setScoreChange(delta)

    // 4. Record the scan — prevents rescanning this token
    await supabase.from('scans').insert({
      user_id: user.id,
      qr_token: token,
      is_correct: correct,
    })

    // 5. Update cumulative score
    const updatedScore = await updateScore(user.id, delta)
    setNewScore(updatedScore)
    setPhase('result')
  }

  // ── Render phases ─────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return <LoadingScreen text="Scanning QR..." />
  }

  if (phase === 'auth') {
    return (
      <CenteredCard>
        <div className="text-center py-4">
          <span className="font-orbitron text-5xl text-cyan-neon block mb-6 animate-glow-pulse drop-shadow-[0_0_15px_rgba(77,216,230,0.6)]">◈</span>
          <h2 className="font-orbitron font-black text-xl text-white mb-4 tracking-widest uppercase">ENCRYPTED ACCESS</h2>
          <p className="font-manrope font-bold text-white/40 text-xs mb-8 tracking-widest uppercase uppercase">
            Identity verification required to scan void tokens.
          </p>
          <div className="flex flex-col gap-4">
            <button
              className="btn-neon-cyan w-full py-4 text-xs tracking-[0.3em]"
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
            >
              INITIALIZE LOGIN
            </button>
            <button
              className="font-manrope text-[0.65rem] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-[0.4em] py-2"
              onClick={() => navigate(`/register?redirect=${encodeURIComponent(window.location.href)}`)}
            >
              Create Account
            </button>
          </div>
        </div>
      </CenteredCard>
    )
  }

  if (phase === 'already-scanned') {
    return (
      <CenteredCard>
        <div className="text-center py-4">
          <span
            className="font-orbitron text-5xl text-pink-neon block mb-6 drop-shadow-[0_0_15px_rgba(232,67,147,0.6)]"
          >⊗</span>
          <h2 className="font-orbitron font-black text-xl text-white mb-4 tracking-widest uppercase">VOID TOKEN USED</h2>
          <p className="font-manrope font-bold text-white/40 text-xs mb-8 tracking-widest uppercase">
            This frequency has already been harvested.
          </p>
          <div className="flex flex-col gap-4">
            <button className="btn-neon-cyan w-full py-4 text-xs tracking-[0.3em]" onClick={() => navigate('/leaderboard')}>
              RANKINGS
            </button>
            <button className="font-manrope text-[0.65rem] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-[0.4em] py-2" onClick={() => navigate('/')}>
              RETURN TO HUB
            </button>
          </div>
        </div>
      </CenteredCard>
    )
  }

  if (phase === 'error') {
    return (
      <CenteredCard>
        <div className="text-center py-4">
          <span className="font-orbitron text-5xl text-pink-neon block mb-6 drop-shadow-[0_0_15px_rgba(232,67,147,0.6)]">⚠</span>
          <h2 className="font-orbitron font-black text-xl text-white mb-4 tracking-widest uppercase">SYSTEM ERROR</h2>
          <p className="font-manrope font-bold text-white/40 text-xs mb-8 tracking-widest uppercase">{message}</p>
          <button className="btn-neon-cyan w-full py-4 text-xs tracking-[0.3em]" onClick={() => navigate('/')}>
            RESET HUB
          </button>
        </div>
      </CenteredCard>
    )
  }

  if (phase === 'result') {
    return (
      <div className="min-h-screen px-4 pt-4 pb-10 flex items-center justify-center">
        <div className="relative w-full max-w-lg mx-auto animate-fade-in-slow">
          <div
            className={`bg-black/40 backdrop-blur-2xl relative p-8 sm:p-12 text-center rounded-[2.5rem] border ${isCorrect ? 'border-green-400/20' : 'border-pink-neon/20'} shadow-2xl overflow-hidden`}
          >
            {/* Background decorative ring */}
            <div className={`absolute top-[-20%] left-[-20%] w-[140%] h-[140%] rounded-full opacity-10 pointer-events-none ${isCorrect ? 'bg-green-400/30' : 'bg-pink-neon/30'} blur-[100px] animate-pulse`} />

            {/* Result icon */}
            <div
              className="text-7xl mb-6 font-orbitron"
              style={isCorrect
                ? { color: '#4ade80', filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.6))' }
                : { color: '#e84393', filter: 'drop-shadow(0 0 20px rgba(232,67,147,0.6))' }}
            >
              {isCorrect ? '✓' : '✗'}
            </div>

            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-4 tracking-widest uppercase italic">
              {isCorrect ? 'SYNCHRONIZED' : 'DESYNCED'}
            </h2>

            {/* Score delta */}
            <div className="flex flex-col items-center justify-center mb-10">
              <span
                className="font-orbitron text-5xl font-black italic"
                style={isCorrect
                  ? { color: '#4ade80', filter: 'drop-shadow(0 0 10px rgba(74,222,128,0.4))' }
                  : { color: '#e84393', filter: 'drop-shadow(0 0 10px rgba(232,67,147,0.4))' }}
              >
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </span>
              <span className="font-manrope font-bold text-white/30 text-[0.6rem] uppercase tracking-[0.5em] mt-2">Points Harvested</span>
            </div>

            {/* Reveal correct answer when wrong */}
            {!isCorrect && question && (
              <div className="mb-10 px-6 py-4 rounded-2xl border border-green-400/10 bg-green-400/5 text-center">
                <p className="font-orbitron text-[0.55rem] font-bold text-white/30 mb-2 uppercase tracking-[0.2em]">Validated Protocol</p>
                <p className="font-orbitron font-bold text-sm text-green-300 tracking-wider">
                  {OPTION_LABELS[question.correct]}. {question.options[question.correct]}
                </p>
              </div>
            )}

            {/* Total score */}
            {newScore !== null && (
              <div className="mb-10 p-6 rounded-2xl border border-cyan-neon/10 bg-cyan-neon/5">
                <p className="font-orbitron text-[0.55rem] font-bold text-white/20 uppercase tracking-[0.5em] mb-2">Current Magnitude</p>
                <p
                  className="font-orbitron font-black text-3xl text-cyan-neon italic"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(77,216,230,0.4))' }}
                >
                  {newScore} <span className="text-xs italic tracking-widest text-white/40 ml-1">PTS</span>
                </p>
              </div>
            )}

            {/* Confession Unlock Notice */}
            {isCorrect && (
              <div className="mb-10 p-2 rounded-3xl border border-pink-neon/20 bg-pink-neon/[0.02] group">
                <div className="p-6 rounded-[1.4rem] bg-pink-neon/5 flex flex-col items-center gap-4 transition-all duration-500 group-hover:bg-pink-neon/10">
                  <div className="w-10 h-10 rounded-full bg-pink-neon/20 flex items-center justify-center text-xl animate-bounce">🍵</div>
                  <div className="text-center">
                    <p className="font-orbitron font-black text-xs text-pink-neon tracking-widest">SPILL PASS EARNED</p>
                    <p className="font-manrope font-bold text-[0.6rem] text-white/40 uppercase tracking-widest mt-1">Void confession protocol active.</p>
                  </div>
                  <button
                    className="w-full bg-pink-neon text-white font-orbitron font-black text-[0.65rem] tracking-[0.2em] py-4 rounded-xl hover:shadow-[0_0_25px_rgba(232,67,147,0.5)] transition-all uppercase"
                    onClick={() => navigate('/confessions')}
                  >
                    DISCHARGE TEA →
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button className="btn-neon-cyan w-full py-4 text-xs tracking-[0.3em]" onClick={() => navigate('/leaderboard')}>
                RANKINGS
              </button>
              <button className="font-manrope text-[0.65rem] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-[0.4em] py-2" onClick={() => navigate('/')}>
                RETURN TO HUB
              </button>
            </div>
          </div>

          {/* Social Sneak Peek - Shows recent confessions directly on the results page */}
          <div className="mt-12 w-full max-w-lg mx-auto pb-10">
            <div className="text-center mb-8">
              <span className="font-orbitron font-black text-[0.6rem] text-cyan-neon tracking-[0.5em] uppercase px-4 py-2 border border-cyan-neon/20 rounded-full bg-cyan-neon/5">
                VOID ACTIVITY
              </span>
            </div>
            <div className="bg-black/20 backdrop-blur-xl rounded-[2rem] border border-white/5 p-4">
              <ConfessionsFeed limit={3} showHeader={false} compact={true} />
              <button
                onClick={() => navigate('/confessions')}
                className="w-full mt-4 py-4 font-orbitron font-bold text-[0.6rem] text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.3em]"
              >
                View All Transmissions →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // phase === 'question'
  return (
    <div className="min-h-screen px-4 pt-4 pb-10 scanline-bg">
      <div
        className="fixed top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #4dd8e6, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div className="w-full max-w-lg mx-auto">
        {/* Token status badges */}
        <div className="flex items-center gap-2 mb-4">
          <div className="glass-card px-3 py-1.5 inline-flex items-center gap-2 rounded-full border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-orbitron text-xs text-white/30">QR ACTIVE</span>
          </div>
          <div className="glass-card px-3 py-1.5 inline-flex items-center gap-2 rounded-full border-white/5">
            <span className="font-orbitron text-xs text-white/20 truncate max-w-[140px]">
              {token?.substring(0, 12)}…
            </span>
          </div>
        </div>

        {question && (
          <QuestionCard question={question.question}>
            {question.options.map((optionText, idx) => {
              let result = null
              if (submitted) {
                if (idx === question.correct) result = 'correct'
                else if (idx === selected) result = 'wrong'
              }
              return (
                <AnswerButton
                  key={idx}
                  label={OPTION_LABELS[idx]}
                  text={optionText}
                  selected={selected === idx}
                  result={result}
                  disabled={submitted}
                  onClick={() => !submitted && setSelected(idx)}
                />
              )
            })}

            <div className="mt-6">
              <button
                className="btn-solid-cyan w-full"
                style={{ minHeight: '56px', fontSize: '15px', letterSpacing: '0.12em' }}
                disabled={selected === null || submitted}
                onClick={handleSubmit}
              >
                {submitted ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </QuestionCard>
        )}
      </div>
    </div>
  )
}

function LoadingScreen({ text }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-neon/20" />
          <div
            className="absolute inset-0 rounded-full border-t-2 border-cyan-neon animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <p className="font-orbitron text-sm text-cyan-neon tracking-widest">{text}</p>
      </div>
    </div>
  )
}

function CenteredCard({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 scanline-bg">
      <div className="glass-card-cyan relative p-6 sm:p-8 max-w-md w-full corner-decoration animate-slide-up">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-neon/50 to-transparent" />
        {children}
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-pink-neon/30 to-transparent" />
      </div>
    </div>
  )
}
