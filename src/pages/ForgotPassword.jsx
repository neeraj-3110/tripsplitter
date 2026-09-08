import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setInfo('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (error) throw error

      setInfo(
        'If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder.'
      )
    } catch (err) {
      console.error('Password reset error:', err)

      setError(
        err.message || 'Could not send the reset email. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-ink-50 px-4">

      <div className="mb-8 text-center">
        <div className="mb-3 text-4xl">🔐</div>

        <h1 className="text-2xl font-bold text-ink-900">
          Reset Password
        </h1>

        <p className="mt-1 text-sm text-ink-500">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      <div className="card w-full max-w-sm p-6">

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Email
            </label>

            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {info && (
            <p className="text-sm text-brand-700">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting
              ? 'Sending…'
              : 'Send Reset Link'}
          </button>

        </form>

        <div className="mt-5 text-center text-sm">
          <Link
            to="/"
            className="font-medium text-brand-700 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  )
}