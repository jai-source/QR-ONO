import { supabase } from '../supabase/supabaseClient'

/**
 * Adds points to a user's score. Creates the scoreboard row if it doesn't exist.
 * @param {string} userId
 * @param {number} delta - positive or negative
 */
export async function updateScore(userId, delta) {
  // Upsert ensures the row exists; then increment atomically via RPC
  const { data: existing } = await supabase
    .from('scoreboard')
    .select('score')
    .eq('user_id', userId)
    .single()

  if (existing) {
    const newScore = Math.max(0, existing.score + delta)
    const { error } = await supabase
      .from('scoreboard')
      .update({ score: newScore })
      .eq('user_id', userId)
    if (error) throw error
    return newScore
  } else {
    // First time scoring
    const initialScore = Math.max(0, delta)
    const { error } = await supabase
      .from('scoreboard')
      .insert({ user_id: userId, score: initialScore })
    if (error) throw error
    return initialScore
  }
}

/**
 * Fetches the current score for a user.
 * @param {string} userId
 * @returns {number}
 */
export async function getUserScore(userId) {
  const { data, error } = await supabase
    .from('scoreboard')
    .select('score')
    .eq('user_id', userId)
    .single()

  if (error) return 0
  return data?.score ?? 0
}

/**
 * Fetches the leaderboard (top 20 scores).
 * @returns {Array}
 */
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('scoreboard')
    .select('user_id, score, profiles(username, email)')
    .order('score', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}
