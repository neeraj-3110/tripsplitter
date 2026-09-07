import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(email, password, name.trim())
        if (!data.session) {
          setInfo('Account created! Check your email to confirm, then log in.')
          setMode('login')
        }
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-ink-50 px-4">
      <div className="mb-8 text-center">
        <div className="mb-3 text-4xl">🧾</div>
        <h1 className="text-2xl font-bold text-ink-900">TripSplit</h1>
        <p className="mt-1 text-sm text-ink-500">
          Split expenses with friends — and remember where the money went.
        </p>
      </div>

      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 flex rounded-xl bg-ink-100 p-1 text-sm font-medium">
          <button
            className={`flex-1 rounded-lg py-2 transition ${
              mode === 'login' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
            }`}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button
            className={`flex-1 rounded-lg py-2 transition ${
              mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
            }`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">Your name</label>
              <input
                className="input-field"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Email</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-brand-700">{info}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
