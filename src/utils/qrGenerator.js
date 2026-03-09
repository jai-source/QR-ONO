/**
 * Utility to build a play URL for a given QR token.
 * The base URL is read from the VITE_APP_URL env variable (falls back to window.location.origin).
 */
export function buildPlayUrl(token) {
  const base =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL
      ? import.meta.env.VITE_APP_URL
      : typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:5173'

  return `${base}/play?token=${encodeURIComponent(token)}`
}
