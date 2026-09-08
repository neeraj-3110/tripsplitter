import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [ready, setReady] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let mounted = true

    const prepareReset = async () => {
      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      if (data.session) {
        setReady(true)
      }
    }

    prepareReset()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'PASSWORD_RECOVERY' && session) {
        setReady(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setInfo('')

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      setInfo(
        'Password updated successfully! Redirecting to login…'
      )

      await supabase.auth.signOut()

      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      console.error('Update password error:', err)

      setError(
        err.message || 'Could not update your password.'
      )
    } finally {
      setUpdating(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-ink-50 px-4">
        <div className="card w-full max-w-sm p-6 text-center">
          <h2 className="text-xl font-bold text-ink-900">
            Password Reset
          </h2>

          <p className="mt-2 text-sm text-ink-500">
            Checking your reset link…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-ink-50 px-4">

      <div className="mb-8 text-center">
        <div className="mb-3 text-4xl">🔑</div>

        <h1 className="text-2xl font-bold text-ink-900">
          Create New Password
        </h1>

        <p className="mt-1 text-sm text-ink-500">
          Enter your new password below.
        </p>
      </div>

      <div className="card w-full max-w-sm p-6">

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              New Password
            </label>

            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Confirm New Password
            </label>

            <input
              className="input-field"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
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
            disabled={updating}
            className="btn-primary w-full"
          >
            {updating
              ? 'Updating…'
              : 'Update Password'}
          </button>

        </form>

      </div>
    </div>
  )
}